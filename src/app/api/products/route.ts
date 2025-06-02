// File: app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; // Pastikan path ini benar
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Helper function untuk menangani error Prisma
function handlePrismaError(error: any, resourceName: string = "Sumber daya") {
  console.error(`HANDLER Prisma Error [${resourceName}]:`, error); // Log lebih detail
  if (error.code) {
    console.error(`HANDLER Prisma Error Code: ${error.code}`);
    if (error.meta) {
      console.error(`HANDLER Prisma Error Meta:`, error.meta);
    }
  }

  if (error.code === 'P2002') {
    const fields = error.meta?.target?.join(', ');
    return NextResponse.json({ error: `${resourceName} dengan ${fields} ini sudah ada.` }, { status: 409 });
  }
  if (error.code === 'P2003') {
    const fieldName = error.meta?.field_name;
    if (typeof fieldName === 'string' && fieldName.toLowerCase().includes('categoryid')) {
      return NextResponse.json({ error: `Kategori yang dipilih tidak valid atau tidak ditemukan (ID: ${error.meta?.modelName === 'Product' ? 'tidak diketahui, cek input' : fieldName}). Pastikan kategori ada.` }, { status: 400 });
    }
    return NextResponse.json({ error: `Referensi ke ${fieldName} tidak valid.` }, { status: 400 });
  }
  if (error.code === 'P2025') {
    return NextResponse.json({ error: `${resourceName} yang akan dioperasikan (atau relasinya) tidak ditemukan.` }, { status: 404 });
  }
  // Error umum jika tidak ada kode Prisma spesifik yang ditangani
  const errorMessage = error.message || "Terjadi kesalahan internal pada server.";
  return NextResponse.json({ error: `Terjadi kesalahan pada server saat memproses ${resourceName}. Detail: ${errorMessage}` }, { status: 500 });
}

// Konfigurasi direktori upload
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_UPLOAD_PATH = '/uploads/';

async function ensureUploadDirExists() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    // console.log("Upload directory ensured:", UPLOAD_DIR); // Opsional: log jika direktori berhasil dicek/dibuat
  } catch (error) {
    console.error("CRITICAL: Failed to create upload directory:", error);
    // Melempar error ini akan menyebabkan 500 internal server error jika tidak ditangani di handler utama
    throw new Error("Setup direktori upload gagal. Server tidak dapat menyimpan file.");
  }
}

// GET: Get all products
export async function GET() {
  console.log("API HIT: GET /api/products");
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    console.log(`API SUCCESS: GET /api/products - Found ${products.length} products.`);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("API ERROR: GET /api/products - Error fetching products:", error);
    return handlePrismaError(error, "daftar produk");
  }
}

// POST: Create a new product
export async function POST(req: NextRequest) {
  console.log("API HIT: POST /api/products");
  try {
    await ensureUploadDirExists(); // Pastikan direktori ada sebelum memproses
    const contentType = req.headers.get('content-type') || '';
    console.log("API POST /api/products - Content-Type:", contentType);

    let name: string | null = null;
    let description: string | null = null;
    let priceStr: string | null = null;
    let stockStr: string | null = null;
    let categoryIdStr: string | null = null;
    let imageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      console.log("API POST /api/products - Processing multipart/form-data...");
      const formData = await req.formData();
      name = formData.get('name') as string | null;
      description = formData.get('description') as string | null;
      priceStr = formData.get('price') as string | null;
      stockStr = formData.get('stock') as string | null;
      categoryIdStr = formData.get('category') as string | null; // Diambil sebagai string
      const imageFile = formData.get('image') as File | null;

      console.log("API POST /api/products - FormData Estracted:", { name, description, priceStr, stockStr, categoryIdStr, imageName: imageFile?.name, imageSize: imageFile?.size });


      if (!name || !description || !priceStr || !stockStr || !categoryIdStr) {
        console.warn("API POST /api/products - Validation failed (multipart): Missing required fields.");
        return NextResponse.json({ error: "Field nama, deskripsi, harga, stok, dan kategori wajib diisi (multipart)." }, { status: 400 });
      }

      if (imageFile && imageFile.size > 0) {
        if (!imageFile.type.startsWith('image/')) {
          console.warn("API POST /api/products - Validation failed (multipart): Invalid image file type.");
          return NextResponse.json({ error: "File yang diunggah harus berupa gambar." }, { status: 400 });
        }
        const fileExtension = imageFile.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(UPLOAD_DIR, uniqueFileName);

        console.log(`API POST /api/products - Writing image file to: ${filePath}`);
        const fileBuffer = await imageFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(fileBuffer));
        imageUrl = `${PUBLIC_UPLOAD_PATH}${uniqueFileName}`;
        console.log(`API POST /api/products - Image uploaded, URL: ${imageUrl}`);
      } else {
        const imageURLFromForm = formData.get('image_url') as string | null;
        if (imageURLFromForm) {
          imageUrl = imageURLFromForm;
          console.log(`API POST /api/products - Using image_url from form-data: ${imageUrl}`);
        } else {
          console.warn("API POST /api/products - Validation failed (multipart): Missing image file or image_url.");
          return NextResponse.json({ error: "File gambar atau URL gambar wajib diisi untuk multipart." }, { status: 400 });
        }
      }
    } else if (contentType.includes('application/json')) {
      console.log("API POST /api/products - Processing application/json...");
      const body = await req.json();
      console.log("API POST /api/products - Request body (JSON):", body);

      name = body.name;
      description = body.description;
      priceStr = body.price?.toString(); // Harga dari frontend bisa jadi number
      stockStr = body.stock?.toString(); // Stok dari frontend bisa jadi number
      categoryIdStr = body.category;    // Ini adalah selectedCategoryId (string) dari frontend
      imageUrl = body.image;

      if (!name || !description || priceStr == null || stockStr == null || !categoryIdStr || !imageUrl) {
        console.warn("API POST /api/products - Validation failed (JSON): Missing required fields.");
        return NextResponse.json({ error: "Field nama, deskripsi, harga, stok, ID kategori, dan URL gambar wajib diisi (JSON)." }, { status: 400 });
      }
      if (!/^https?:\/\//.test(imageUrl) && !imageUrl.startsWith(PUBLIC_UPLOAD_PATH)) {
        console.warn("API POST /api/products - Validation failed (JSON): Invalid image URL format.");
        return NextResponse.json({ error: "URL gambar tidak valid. Harus dimulai http(s):// atau path internal (/uploads/)."}, { status: 400 });
      }
    } else {
      console.warn(`API POST /api/products - Unsupported Content-Type: ${contentType}`);
      return NextResponse.json({ error: "Content-Type tidak didukung." }, { status: 415 });
    }

    // Logging data yang diterima sebelum parsing angka dan validasi akhir
    console.log("API POST /api/products - Data received for parsing:", { name, description, priceStr, stockStr, categoryIdStr, imageUrl });

    if (!name || !description || priceStr == null || stockStr == null || !categoryIdStr || !imageUrl) {
        console.warn("API POST /api/products - Fallback Validation: Data produk tidak lengkap.");
        return NextResponse.json({ error: "Data produk tidak lengkap setelah pemrosesan awal." }, { status: 400 });
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);
    const categoryId = parseInt(categoryIdStr, 10); // categoryIdStr di-parse di sini

    console.log("API POST /api/products - Parsed numeric values:", { price, stock, categoryId });

    if (isNaN(price) || price < 0) {
      console.warn("API POST /api/products - Validation failed: Invalid price format or negative value.");
      return NextResponse.json({ error: "Format harga tidak valid atau harga negatif." }, { status: 400 });
    }
    if (isNaN(stock) || stock < 0) {
      console.warn("API POST /api/products - Validation failed: Invalid stock format or negative value.");
      return NextResponse.json({ error: "Format stok tidak valid atau stok negatif." }, { status: 400 });
    }
    if (isNaN(categoryId)) {
      // Ini krusial: jika categoryIdStr dari frontend kosong atau bukan angka, categoryId akan NaN
      console.warn(`API POST /api/products - Validation failed: Invalid Category ID format. Original categoryIdStr: '${categoryIdStr}'`);
      return NextResponse.json({ error: `Format ID Kategori tidak valid. ID yang diterima: '${categoryIdStr}'.` }, { status: 400 });
    }

    // VERIFIKASI KATEGORI SEBELUM CREATE PRODUK
    console.log(`API POST /api/products - Verifying category with ID: ${categoryId}`);
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      console.warn(`API POST /api/products - Validation failed: Category with ID ${categoryId} not found.`);
      return NextResponse.json({ error: `Kategori dengan ID ${categoryId} yang dipilih tidak ditemukan.` }, { status: 400 });
    }
    console.log(`API POST /api/products - Category ${categoryId} verified:`, categoryExists.name);

    const productDataToCreate = {
      name,
      description,
      price,
      stock,
      image: imageUrl,
      categoryId: categoryId, // Langsung menggunakan categoryId yang sudah diparsing
      // Jika relasi Anda di Prisma schema menggunakan `category: { connect: { id: categoryId } }`
      // maka di sini seharusnya:
      // category: {
      //   connect: { id: categoryId },
      // },
    };
    console.log("API POST /api/products - Data to be created in DB:", productDataToCreate);


    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        image: imageUrl,
        category: { // Pastikan ini sesuai dengan skema Prisma Anda
          connect: { id: categoryId },
        },
      },
      include: { category: true }
    });

    console.log("API SUCCESS: POST /api/products - Product created successfully in DB:", newProduct);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error("API ERROR: POST /api/products - Unhandled error in POST handler:", error);
    if (error.message.includes("ensureUploadDirExists")) { // Jika error dari ensureUploadDirExists
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      console.warn("API POST /api/products - JSON Parsing Error:", error.message);
      return NextResponse.json({ error: "Format JSON pada request body tidak valid." }, { status: 400 });
    }
    // Seharusnya error Prisma sudah ditangani oleh handlePrismaError
    return handlePrismaError(error, "pembuatan produk");
  }
}

// ... (Kode PUT dan DELETE tetap sama, tambahkan logging serupa jika diperlukan)
// PUT: Update a product
export async function PUT(req: NextRequest) {
  console.log("API HIT: PUT /api/products");
  try {
    await ensureUploadDirExists();
    const contentType = req.headers.get('content-type') || '';
    console.log("API PUT /api/products - Content-Type:", contentType);

    let productIdStr: string | null = null;
    let name: string | undefined;
    let description: string | undefined;
    let priceStr: string | undefined;
    let stockStr: string | undefined;
    let categoryIdStrUpdate: string | undefined; // Ganti nama variabel agar tidak konflik
    let newImageUrl: string | undefined;

    let requestData; // Untuk logging

    if (contentType.includes('multipart/form-data')) {
      console.log("API PUT /api/products - Processing multipart/form-data...");
      const formData = await req.formData();
      // Konversi formData ke objek untuk logging (hati-hati dengan File object)
      const formDataEntries: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        formDataEntries[key] = value instanceof File ? { name: value.name, size: value.size, type: value.type } : value;
      }
      requestData = formDataEntries;
      console.log("API PUT /api/products - FormData Received:", requestData);

      productIdStr = formData.get('id') as string | null;
      name = formData.get('name') as string | undefined;
      description = formData.get('description') as string | undefined;
      priceStr = formData.get('price') as string | undefined;
      stockStr = formData.get('stock') as string | undefined;
      categoryIdStrUpdate = formData.get('category') as string | undefined;
      const imageFile = formData.get('image') as File | null;

      if (!productIdStr) {
        console.warn("API PUT /api/products - Validation failed (multipart): Missing product ID.");
        return NextResponse.json({ error: "ID produk wajib diisi untuk update." }, { status: 400 });
      }

      if (imageFile && imageFile.size > 0) {
        if (!imageFile.type.startsWith('image/')) {
          console.warn("API PUT /api/products - Validation failed (multipart): Invalid image file type.");
          return NextResponse.json({ error: "File yang diunggah harus berupa gambar." }, { status: 400 });
        }
        const fileExtension = imageFile.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(UPLOAD_DIR, uniqueFileName);
        console.log(`API PUT /api/products - Writing new image file to: ${filePath}`);
        const fileBuffer = await imageFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(fileBuffer));
        newImageUrl = `${PUBLIC_UPLOAD_PATH}${uniqueFileName}`;
        console.log(`API PUT /api/products - New image uploaded, URL: ${newImageUrl}`);
      } else if (formData.has('image_url')) {
        newImageUrl = formData.get('image_url') as string | undefined;
        console.log(`API PUT /api/products - Using new image_url from form-data: ${newImageUrl}`);
      }
    } else if (contentType.includes('application/json')) {
      console.log("API PUT /api/products - Processing application/json...");
      const body = await req.json();
      requestData = body;
      console.log("API PUT /api/products - Request body (JSON):", body);

      productIdStr = body.id?.toString();
      name = body.name;
      description = body.description;
      priceStr = body.price?.toString();
      stockStr = body.stock?.toString();
      categoryIdStrUpdate = body.category?.toString(); // Ini adalah ID kategori baru (string)
      newImageUrl = body.image; // Ini adalah imageUrl baru dari input URL, opsional

      if (!productIdStr) {
        console.warn("API PUT /api/products - Validation failed (JSON): Missing product ID.");
        return NextResponse.json({ error: "ID produk wajib diisi untuk update." }, { status: 400 });
      }
      if (newImageUrl && !/^https?:\/\//.test(newImageUrl) && !newImageUrl.startsWith(PUBLIC_UPLOAD_PATH)) {
        console.warn("API PUT /api/products - Validation failed (JSON): Invalid new image URL format.");
        return NextResponse.json({ error: "URL gambar baru tidak valid." }, { status: 400 });
      }
    } else {
      console.warn(`API PUT /api/products - Unsupported Content-Type: ${contentType}`);
      return NextResponse.json({ error: "Content-Type tidak didukung." }, { status: 415 });
    }

    if (!productIdStr) {
      console.warn("API PUT /api/products - Fallback Validation: Product ID not found in request.");
      return NextResponse.json({ error: "ID produk tidak ditemukan dalam request." }, { status: 400 });
    }
    const productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) {
      console.warn(`API PUT /api/products - Validation failed: Invalid Product ID format. Original productIdStr: '${productIdStr}'`);
      return NextResponse.json({ error: `Format ID Produk tidak valid. ID diterima: '${productIdStr}'.` }, { status: 400 });
    }

    console.log(`API PUT /api/products - Attempting to find product with ID: ${productId}`);
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      console.warn(`API PUT /api/products - Product with ID ${productId} not found for update.`);
      return NextResponse.json({ error: "Produk yang akan diupdate tidak ditemukan." }, { status: 404 });
    }
    console.log(`API PUT /api/products - Product found:`, existingProduct.name);

    const dataToUpdate: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      image?: string;
      categoryId?: number; // Jika Anda mengupdate categoryId secara langsung
      // category?: { connect?: { id: number } }; // Alternatif jika Anda ingin menggunakan 'connect'
    } = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (priceStr !== undefined) {
      const price = parseFloat(priceStr);
      if (isNaN(price) || price < 0) {
        console.warn("API PUT /api/products - Validation failed: Invalid price format for update.");
        return NextResponse.json({ error: "Format harga tidak valid untuk update." }, { status: 400 });
      }
      dataToUpdate.price = price;
    }
    if (stockStr !== undefined) {
      const stock = parseInt(stockStr, 10);
      if (isNaN(stock) || stock < 0) {
        console.warn("API PUT /api/products - Validation failed: Invalid stock format for update.");
        return NextResponse.json({ error: "Format stok tidak valid untuk update." }, { status: 400 });
      }
      dataToUpdate.stock = stock;
    }

    if (categoryIdStrUpdate !== undefined) {
      const newCategoryId = parseInt(categoryIdStrUpdate, 10);
      if (isNaN(newCategoryId)) {
        console.warn(`API PUT /api/products - Validation failed: Invalid Category ID format for update. Original categoryIdStr: '${categoryIdStrUpdate}'`);
        return NextResponse.json({ error: `Format ID Kategori baru tidak valid. ID diterima: '${categoryIdStrUpdate}'.` }, { status: 400 });
      }
      // VERIFIKASI KATEGORI BARU SEBELUM UPDATE
      console.log(`API PUT /api/products - Verifying new category with ID: ${newCategoryId} for update.`);
      const newCategoryExists = await prisma.category.findUnique({ where: { id: newCategoryId } });
      if (!newCategoryExists) {
        console.warn(`API PUT /api/products - Validation failed: New category with ID ${newCategoryId} not found for update.`);
        return NextResponse.json({ error: `Kategori baru dengan ID ${newCategoryId} yang dipilih tidak ditemukan.` }, { status: 400 });
      }
      console.log(`API PUT /api/products - New category ${newCategoryId} verified:`, newCategoryExists.name);
      dataToUpdate.categoryId = newCategoryId; // atau gunakan dataToUpdate.category = { connect: {id: newCategoryId }}
    }

    if (newImageUrl !== undefined) {
      dataToUpdate.image = newImageUrl;
      if (existingProduct.image && existingProduct.image !== newImageUrl && existingProduct.image.startsWith(PUBLIC_UPLOAD_PATH)) {
        try {
          const oldImagePath = path.join(process.cwd(), 'public', existingProduct.image);
          console.log(`API PUT /api/products - Attempting to delete old image: ${oldImagePath}`);
          await unlink(oldImagePath);
          console.log("API PUT /api/products - Old image deleted successfully.");
        } catch (err: any) {
          console.warn(`API PUT /api/products - Failed to delete old image: ${existingProduct.image}`, err.message);
        }
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      console.log("API PUT /api/products - No data provided for update.");
      return NextResponse.json({ message: "Tidak ada data yang diupdate.", product: existingProduct }, { status: 200 }); // Atau error 400 jika dianggap salah
    }

    console.log(`API PUT /api/products - Data to be updated in DB for product ID ${productId}:`, dataToUpdate);
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
      include: { category: true }
    });

    console.log("API SUCCESS: PUT /api/products - Product updated successfully in DB:", updatedProduct);
    return NextResponse.json(updatedProduct);

  } catch (error: any) {
    console.error("API ERROR: PUT /api/products - Unhandled error in PUT handler:", error);
    if (error.message.includes("ensureUploadDirExists")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      console.warn("API PUT /api/products - JSON Parsing Error:", error.message);
      return NextResponse.json({ error: "Format JSON pada request body tidak valid." }, { status: 400 });
    }
    return handlePrismaError(error, `update produk (ID: ${ (error.meta?.target as any)?.id || 'tidak diketahui'})`);
  }
}

// DELETE: Delete a product
export async function DELETE(req: NextRequest) {
  console.log("API HIT: DELETE /api/products");
  try {
    const body = await req.json(); // Umumnya ID ada di query params, tapi JSON body juga bisa
    console.log("API DELETE /api/products - Request body (JSON):", body);
    const productIdStr = body.id?.toString();

    if (!productIdStr) {
      console.warn("API DELETE /api/products - Validation failed: Missing product ID.");
      return NextResponse.json({ error: "ID produk wajib diisi untuk dihapus." }, { status: 400 });
    }
    const productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) {
      console.warn(`API DELETE /api/products - Validation failed: Invalid Product ID format. Original productIdStr: '${productIdStr}'`);
      return NextResponse.json({ error: `Format ID Produk tidak valid. ID diterima: '${productIdStr}'.` }, { status: 400 });
    }

    console.log(`API DELETE /api/products - Attempting to find product with ID: ${productId} for deletion.`);
    const productToDelete = await prisma.product.findUnique({ where: { id: productId } });

    if (!productToDelete) {
      // Jika produk tidak ditemukan, ini adalah error P2025 yang akan ditangani handlePrismaError
      // Namun, kita bisa log lebih dulu atau langsung return 404
      console.warn(`API DELETE /api/products - Product with ID ${productId} not found for deletion.`);
      // Melempar error agar ditangani oleh handlePrismaError dengan P2025
      // atau return langsung: return NextResponse.json({ error: "Produk yang akan dihapus tidak ditemukan." }, { status: 404 });
      // Untuk konsistensi, biarkan Prisma yang melempar error saat delete jika tidak ditemukan
    } else if (productToDelete.image && productToDelete.image.startsWith(PUBLIC_UPLOAD_PATH)) {
        try {
          const imagePath = path.join(process.cwd(), 'public', productToDelete.image);
          console.log(`API DELETE /api/products - Attempting to delete product image: ${imagePath}`);
          await unlink(imagePath);
          console.log("API DELETE /api/products - Product image deleted successfully.");
        } catch (err: any) {
          console.warn(`API DELETE /api/products - Failed to delete product image: ${productToDelete.image}`, err.message);
        }
    }

    console.log(`API DELETE /api/products - Attempting to delete product with ID: ${productId} from DB.`);
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });

    console.log("API SUCCESS: DELETE /api/products - Product deleted successfully from DB:", deletedProduct);
    return NextResponse.json({ message: "Produk berhasil dihapus.", product: deletedProduct });

  } catch (error: any) {
    console.error("API ERROR: DELETE /api/products - Unhandled error in DELETE handler:", error);
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      console.warn("API DELETE /api/products - JSON Parsing Error:", error.message);
      return NextResponse.json({ error: "Format JSON pada request body tidak valid." }, { status: 400 });
    }
    // handlePrismaError akan menangani P2025 jika produk tidak ditemukan saat .delete()
    return handlePrismaError(error, "penghapusan produk");
  }
}