// File: app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; // Pastikan path ini benar
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from "@prisma/client";

// ---- KONFIGURASI S3 ----
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_S3_REGION = process.env.AWS_S3_REGION;

if (!S3_BUCKET_NAME || !AWS_S3_REGION) {
  console.error("CRITICAL: AWS S3 Bucket Name or Region not configured in environment variables.");
  // Pertimbangkan untuk melempar error jika S3 adalah komponen vital
  // throw new Error("AWS S3 Bucket Name or Region not configured.");
}

const s3Client = new S3Client({
  region: AWS_S3_REGION,
  // Kredensial (accessKeyId, secretAccessKey) akan diambil secara otomatis
  // dari variabel lingkungan standar AWS atau IAM Role jika di-deploy di AWS.
  // Pastikan AWS_ACCESS_KEY_ID dan AWS_SECRET_ACCESS_KEY terkonfigurasi di .env.local untuk pengembangan.
});

// Helper function untuk membuat URL S3
function getS3FileUrl(bucketName: string, region: string, key: string): string {
  if (region === 'us-east-1') {
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  }
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

// Helper function untuk menghapus objek S3 berdasarkan URL lengkap
async function deleteS3ObjectByUrl(imageUrl: string) {
  if (!imageUrl || !S3_BUCKET_NAME || !AWS_S3_REGION) {
    console.warn("S3 DELETE: Missing imageUrl, S3_BUCKET_NAME, or AWS_S3_REGION. Skipping delete.");
    return;
  }

  // Hanya proses jika URL berasal dari bucket S3 kita
  if (!imageUrl.includes(S3_BUCKET_NAME)) {
      console.log(`S3 DELETE: URL ${imageUrl} does not seem to be from the configured S3 bucket. Skipping delete.`);
      return;
  }

  try {
    const url = new URL(imageUrl);
    const s3Key = decodeURIComponent(url.pathname.substring(1)); // Menghapus '/' di awal dan decode URI component

    if (!s3Key) {
      console.warn(`S3 DELETE: Invalid S3 key extracted from URL: ${imageUrl}`);
      return;
    }

    console.log(`S3 DELETE: Attempting to delete S3 object with Key: ${s3Key} from Bucket: ${S3_BUCKET_NAME}`);
    const deleteParams = {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`S3 DELETE: Successfully deleted object ${s3Key} from S3.`);
  } catch (error: unknown) {
    console.error(`S3 DELETE: Failed to delete object from S3 for URL ${imageUrl}:`, error);
  }
}

// Helper function untuk menangani error Prisma
function handlePrismaError(error: unknown, resourceName: string = "Sumber daya", contextId?: string | number): NextResponse {
  console.error(`HANDLER Prisma Error [${resourceName}${contextId ? ` ID: ${contextId}` : ''}]:`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`HANDLER Prisma Error Code: ${error.code}, Meta:`, error.meta);
    if (error.code === 'P2002') {
      const fields = (error.meta?.target as string[])?.join(', ');
      return NextResponse.json({ error: `${resourceName} dengan ${fields || 'input'} ini sudah ada.` }, { status: 409 });
    }
    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name as string | undefined;
      if (typeof fieldName === 'string' && fieldName.toLowerCase().includes('categoryid')) {
        return NextResponse.json({ error: `Kategori yang dipilih tidak valid atau tidak ditemukan. Pastikan kategori ada.` }, { status: 400 });
      }
      return NextResponse.json({ error: `Referensi ke ${fieldName || 'data terkait'} tidak valid.` }, { status: 400 });
    }
    if (error.code === 'P2025') {
      // Pesan error.message dari Prisma P2025 biasanya cukup deskriptif
      const prismaMessage = (error.message || `${resourceName} yang akan dioperasikan tidak ditemukan.`).replace(/\n/g, '');
      return NextResponse.json({ error: prismaMessage }, { status: 404 });
    }
  }

  let errorMessage = "Terjadi kesalahan internal pada server.";
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return NextResponse.json({ error: `Terjadi kesalahan pada server saat memproses ${resourceName}. Detail: ${errorMessage}` }, { status: 500 });
}


// GET: Get all products
export async function GET() {
  console.log("API HIT: GET /api/products");
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`API SUCCESS: GET /api/products - Found ${products.length} products.`);
    return NextResponse.json(products);
  } catch (error: unknown) {
    console.error("API ERROR: GET /api/products - Error fetching products:", error);
    return handlePrismaError(error, "daftar produk");
  }
}

// POST: Create a new product
export async function POST(req: NextRequest) {
  console.log("API HIT: POST /api/products");
  if (!S3_BUCKET_NAME || !AWS_S3_REGION) {
    console.error("API POST /api/products - S3 not configured.");
    return NextResponse.json({ error: "Konfigurasi S3 tidak lengkap di server." }, { status: 500 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    console.log("API POST /api/products - Content-Type:", contentType);

    let name: string | null = null;
    let description: string | null = null;
    let priceStr: string | null = null;
    let stockStr: string | null = null;
    let categoryIdStr: string | null = null;
    let finalImageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      console.log("API POST /api/products - Processing multipart/form-data...");
      const formData = await req.formData();
      name = formData.get('name') as string | null;
      description = formData.get('description') as string | null;
      priceStr = formData.get('price') as string | null;
      stockStr = formData.get('stock') as string | null;
      categoryIdStr = formData.get('category') as string | null; // Dari frontend, ini biasanya ID kategori
      const imageFile = formData.get('image') as File | null;

      console.log("API POST /api/products - FormData Extracted:", { name, description, priceStr, stockStr, categoryIdStr, imageName: imageFile?.name, imageSize: imageFile?.size });

      if (!name || !description || !priceStr || !stockStr || !categoryIdStr) {
        return NextResponse.json({ error: "Field nama, deskripsi, harga, stok, dan kategori wajib diisi (multipart)." }, { status: 400 });
      }

      if (imageFile && imageFile.size > 0) {
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json({ error: "File yang diunggah harus berupa gambar." }, { status: 400 });
        }
        const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'png';
        const uniqueS3Key = `produk/${uuidv4()}.${fileExtension}`;
        const fileBuffer = await imageFile.arrayBuffer();

        console.log(`API POST /api/products - Uploading image to S3 with Key: ${uniqueS3Key}`);
        const putObjectParams = {
          Bucket: S3_BUCKET_NAME,
          Key: uniqueS3Key,
          Body: Buffer.from(fileBuffer),
          ContentType: imageFile.type,
        };
        await s3Client.send(new PutObjectCommand(putObjectParams));
        finalImageUrl = getS3FileUrl(S3_BUCKET_NAME, AWS_S3_REGION, uniqueS3Key);
        console.log(`API POST /api/products - Image uploaded to S3, URL: ${finalImageUrl}`);
      } else {
         // Jika tidak ada file gambar yang diunggah dari form, gambar dianggap tidak ada.
         // Anda bisa memutuskan apakah ini error atau gambar bersifat opsional.
         // Jika wajib, kembalikan error:
         return NextResponse.json({ error: "File gambar wajib diisi untuk produk baru (multipart)." }, { status: 400 });
         // Jika opsional, biarkan finalImageUrl null atau set default jika ada.
      }
    } else if (contentType.includes('application/json')) {
      console.log("API POST /api/products - Processing application/json...");
      interface ProductJsonPayload {
        name: string;
        description: string;
        price: string | number;
        stock: string | number;
        category: string; // categoryId dalam bentuk string
        image?: string; // URL gambar, bisa opsional atau wajib tergantung logika Anda
      }
      const body = await req.json() as ProductJsonPayload;
      console.log("API POST /api/products - Request body (JSON):", body);

      name = body.name;
      description = body.description;
      priceStr = body.price?.toString();
      stockStr = body.stock?.toString();
      categoryIdStr = body.category;
      finalImageUrl = body.image || null; // Jika body.image undefined, set ke null

      if (!name || !description || priceStr == null || stockStr == null || !categoryIdStr) {
        return NextResponse.json({ error: "Field nama, deskripsi, harga, stok, dan ID kategori wajib diisi (JSON)." }, { status: 400 });
      }
      // Jika gambar wajib untuk JSON, tambahkan: if (!finalImageUrl) return NextResponse.json(...);
      if (finalImageUrl && !/^https?:\/\//.test(finalImageUrl)) {
        return NextResponse.json({ error: "URL gambar tidak valid. Harus dimulai http(s)://." }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: `Content-Type ${contentType} tidak didukung. Gunakan multipart/form-data atau application/json.` }, { status: 415 });
    }

    if (!name || !description || priceStr == null || stockStr == null || !categoryIdStr) {
      // Pemeriksaan ini mungkin redundan jika sudah ditangani di atas, tapi sebagai failsafe.
      return NextResponse.json({ error: "Data produk tidak lengkap setelah pemrosesan awal." }, { status: 400 });
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);
    const categoryId = parseInt(categoryIdStr, 10);

    if (isNaN(price) || price < 0) return NextResponse.json({ error: "Format harga tidak valid atau harga negatif." }, { status: 400 });
    if (isNaN(stock) || stock < 0) return NextResponse.json({ error: "Format stok tidak valid atau stok negatif." }, { status: 400 });
    if (isNaN(categoryId)) return NextResponse.json({ error: `Format ID Kategori tidak valid. ID yang diterima: '${categoryIdStr}'.` }, { status: 400 });

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) return NextResponse.json({ error: `Kategori dengan ID ${categoryId} yang dipilih tidak ditemukan.` }, { status: 400 });
    
    const newProductData: Prisma.ProductCreateInput = {
      name,
      description,
      price,
      stock,
      category: { connect: { id: categoryId } },
    };

    if (finalImageUrl) {
        newProductData.image = finalImageUrl;
    } else {
        // Jika gambar wajib dan finalImageUrl masih null di sini, seharusnya sudah di-handle sebelumnya.
        // Jika gambar opsional dan tidak ada, maka field image tidak akan ada di newProductData,
        // yang berarti Prisma akan menggunakan nilai default skema atau null jika nullable.
        // Jika Anda ingin eksplisit set null jika tidak ada URL:
        // newProductData.image = null; (pastikan field image di Prisma schema nullable)
    }
    
    const newProduct = await prisma.product.create({
      data: newProductData,
      include: { category: true }
    });
    console.log("API SUCCESS: POST /api/products - Product created successfully in DB:", newProduct);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: unknown) {
    console.error("API ERROR: POST /api/products - Unhandled error in POST handler:", error);
    if (error instanceof Error && (error.name === 'TypeError' || error.message.includes("Failed to parse URL") || error.message.includes("S3"))) {
        // Kesalahan terkait S3 atau URL parsing bisa terjadi sebelum Prisma
        return NextResponse.json({ error: `Gagal memproses atau mengunggah gambar: ${error.message}` }, { status: 500 });
    }
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json({ error: "Format JSON pada request body tidak valid." }, { status: 400 });
    }
    return handlePrismaError(error, "pembuatan produk");
  }
}

// PUT: Update a product
export async function PUT(req: NextRequest) {
  console.log("API HIT: PUT /api/products");
  if (!S3_BUCKET_NAME || !AWS_S3_REGION) {
    return NextResponse.json({ error: "Konfigurasi S3 tidak lengkap di server." }, { status: 500 });
  }

  let productId: number | undefined;

  try {
    const contentType = req.headers.get('content-type') || '';
    console.log("API PUT /api/products - Content-Type:", contentType);

    let productIdStr: string | null = null;
    let name: string | undefined;
    let description: string | undefined;
    let priceStr: string | undefined;
    let stockStr: string | undefined;
    let categoryIdStrUpdate: string | undefined;
    let imageToProcess: File | string | null | undefined = undefined; // Untuk file baru atau URL baru atau null (hapus)

    if (contentType.includes('multipart/form-data')) {
      console.log("API PUT /api/products - Processing multipart/form-data...");
      const formData = await req.formData();

      productIdStr = formData.get('id') as string | null;
      name = formData.get('name') as string | undefined;
      description = formData.get('description') as string | undefined;
      priceStr = formData.get('price') as string | undefined;
      stockStr = formData.get('stock') as string | undefined;
      categoryIdStrUpdate = formData.get('category') as string | undefined;
      
      const imageFile = formData.get('image') as File | null;
      const imageUrlFromForm = formData.get('image_url') as string | undefined; // Untuk mengirim URL baru atau string kosong untuk hapus

      if (imageFile && imageFile.size > 0) {
        imageToProcess = imageFile;
      } else if (imageUrlFromForm !== undefined) { // Ada field 'image_url', bisa URL atau ""
        imageToProcess = imageUrlFromForm === "" ? null : imageUrlFromForm; // null jika string kosong, artinya hapus
      }
      // Jika tidak ada imageFile dan tidak ada image_url, imageToProcess tetap undefined (tidak ada perubahan gambar dari form)

    } else if (contentType.includes('application/json')) {
      console.log("API PUT /api/products - Processing application/json...");
      interface ProductUpdateJsonPayload {
        id: string | number;
        name?: string;
        description?: string;
        price?: string | number;
        stock?: string | number;
        category?: string; // categoryId
        image?: string | null; // Bisa string URL, null untuk menghapus, atau undefined untuk tidak mengubah
      }
      const body = await req.json() as ProductUpdateJsonPayload;
      console.log("API PUT /api/products - Request body (JSON):", body);

      productIdStr = body.id?.toString();
      name = body.name;
      description = body.description;
      priceStr = body.price?.toString();
      stockStr = body.stock?.toString();
      categoryIdStrUpdate = body.category?.toString();
      imageToProcess = body.image; // Bisa URL, null, atau undefined

    } else {
      return NextResponse.json({ error: `Content-Type ${contentType} tidak didukung.` }, { status: 415 });
    }

    if (!productIdStr) return NextResponse.json({ error: "ID produk wajib diisi untuk update." }, { status: 400 });
    productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) return NextResponse.json({ error: `Format ID Produk tidak valid. ID diterima: '${productIdStr}'.` }, { status: 400 });

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) return NextResponse.json({ error: `Produk dengan ID ${productId} yang akan diupdate tidak ditemukan.` }, { status: 404 });

    const dataToUpdate: Prisma.ProductUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    
    if (priceStr !== undefined) {
      const price = parseFloat(priceStr);
      if (isNaN(price) || price < 0) return NextResponse.json({ error: "Format harga tidak valid atau harga negatif." }, { status: 400 });
      dataToUpdate.price = price;
    }
    if (stockStr !== undefined) {
      const stock = parseInt(stockStr, 10);
      if (isNaN(stock) || stock < 0) return NextResponse.json({ error: "Format stok tidak valid atau stok negatif." }, { status: 400 });
      dataToUpdate.stock = stock;
    }
    if (categoryIdStrUpdate !== undefined) {
      const categoryId = parseInt(categoryIdStrUpdate, 10);
      if (isNaN(categoryId)) return NextResponse.json({ error: `Format ID Kategori tidak valid. ID diterima: '${categoryIdStrUpdate}'.` }, { status: 400 });
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) return NextResponse.json({ error: `Kategori dengan ID ${categoryId} yang dipilih tidak ditemukan.` }, { status: 400 });
      dataToUpdate.category = { connect: { id: categoryId } };
    }

    // Logika untuk menangani update gambar
    let newImageUrlForDb: string | null | undefined = undefined; // undefined berarti tidak ada perubahan

    if (imageToProcess instanceof File) { // Ada file baru yang diunggah
        if (!imageToProcess.type.startsWith('image/')) return NextResponse.json({ error: "File yang diunggah harus berupa gambar." }, { status: 400 });
        
        const fileExtension = imageToProcess.name.split('.').pop()?.toLowerCase() || 'png';
        const uniqueS3Key = `produk/${uuidv4()}.${fileExtension}`;
        const fileBuffer = await imageToProcess.arrayBuffer();

        const putObjectParams = { Bucket: S3_BUCKET_NAME!, Key: uniqueS3Key, Body: Buffer.from(fileBuffer), ContentType: imageToProcess.type };
        await s3Client.send(new PutObjectCommand(putObjectParams));
        newImageUrlForDb = getS3FileUrl(S3_BUCKET_NAME!, AWS_S3_REGION!, uniqueS3Key);
        console.log(`API PUT /api/products - New image uploaded to S3, URL: ${newImageUrlForDb}`);
    } else if (typeof imageToProcess === 'string') { // URL gambar baru diberikan
        if (!/^https?:\/\//.test(imageToProcess)) {
            return NextResponse.json({ error: "URL gambar baru tidak valid." }, { status: 400 });
        }
        newImageUrlForDb = imageToProcess;
    } else if (imageToProcess === null) { // Intensi untuk menghapus gambar
        newImageUrlForDb = null;
    }
    // Jika imageToProcess === undefined, berarti tidak ada perubahan gambar dari request, newImageUrlForDb tetap undefined.

    if (newImageUrlForDb !== undefined) { // Jika ada perubahan gambar (URL baru atau null untuk hapus)
        // Hapus gambar lama dari S3 jika ada DAN gambar lama berbeda dengan yang baru (atau yang baru adalah null)
        if (existingProduct.image && existingProduct.image !== newImageUrlForDb) {
            await deleteS3ObjectByUrl(existingProduct.image);
        }
        dataToUpdate.image = newImageUrlForDb; // Set gambar baru (bisa URL atau null)
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: "Tidak ada data yang diupdate.", product: existingProduct }, { status: 200 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
      include: { category: true }
    });
    console.log("API SUCCESS: PUT /api/products - Product updated successfully in DB:", updatedProduct);
    return NextResponse.json(updatedProduct);

  } catch (error: unknown) {
    console.error(`API ERROR: PUT /api/products (Product ID: ${productId ?? 'unknown'}) - Unhandled error:`, error);
    if (error instanceof Error && (error.name === 'TypeError' || error.message.includes("Failed to parse URL") || error.message.includes("S3"))) {
        return NextResponse.json({ error: `Gagal memproses atau mengunggah gambar: ${error.message}` }, { status: 500 });
    }
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json({ error: "Format JSON pada request body tidak valid." }, { status: 400 });
    }
    return handlePrismaError(error, "update produk", productId);
  }
}

// DELETE: Delete a product
export async function DELETE(req: NextRequest) {
  console.log("API HIT: DELETE /api/products");
  if (!S3_BUCKET_NAME || !AWS_S3_REGION) {
    return NextResponse.json({ error: "Konfigurasi S3 tidak lengkap di server." }, { status: 500 });
  }
  
  let productId: number | undefined;

  try {
    interface DeletePayload { id: string | number; } // ID bisa number atau string yang akan di-parse
    const body = await req.json() as DeletePayload;
    const productIdStr = body.id?.toString();

    if (!productIdStr) return NextResponse.json({ error: "ID produk wajib diisi untuk dihapus." }, { status: 400 });
    productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) return NextResponse.json({ error: `Format ID Produk tidak valid. ID diterima: '${productIdStr}'.` }, { status: 400 });

    // Ambil data produk sebelum dihapus untuk mendapatkan URL gambar
    const productToDelete = await prisma.product.findUnique({ where: { id: productId } });

    if (!productToDelete) {
      // Jika produk tidak ada, Prisma akan melempar P2025 saat delete,
      // tapi kita bisa menangkapnya lebih awal jika mau.
      // Namun, menyerahkannya ke handlePrismaError (via P2025 dari delete) juga konsisten.
      console.warn(`API DELETE /api/products - Product with ID ${productId} not found for deletion.`);
    }
    
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });
    // Jika produk tidak ditemukan, prisma.delete akan melempar P2025 yang akan ditangani oleh handlePrismaError

    // Hapus gambar dari S3 SETELAH produk berhasil dihapus dari DB
    if (productToDelete && productToDelete.image) {
        await deleteS3ObjectByUrl(productToDelete.image);
    }
    
    console.log("API SUCCESS: DELETE /api/products - Product deleted successfully from DB:", deletedProduct);
    return NextResponse.json({ message: "Produk berhasil dihapus.", product: deletedProduct });

  } catch (error: unknown) {
    console.error(`API ERROR: DELETE /api/products (Product ID: ${productId ?? 'unknown'}) - Unhandled error:`, error);
     if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json({ error: "Format JSON pada request body tidak valid." }, { status: 400 });
    }
    return handlePrismaError(error, "penghapusan produk", productId);
  }
}