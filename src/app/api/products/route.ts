import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET: Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Handle FormData (untuk upload file)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      // Mendapatkan data produk
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const price = formData.get('price') as string;
      const stock = formData.get('stock') as string;
      const category = formData.get('category') as string;
      const imageFile = formData.get('image') as File;
      
      // Validasi data
      if (!name || !description || !price || !stock || !category || !imageFile) {
        return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
      }
      
      // Menyimpan file gambar
      try {
        // Membuat direktori uploads jika belum ada
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        
        // Membuat nama file unik dengan UUID
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        
        // Konversi file ke array buffer dan simpan
        const fileBuffer = await imageFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(fileBuffer));
        
        // URL untuk gambar (relatif ke public directory)
        const imageUrl = `/uploads/${fileName}`;
        
        // Simpan data produk ke database
        const newProduct = await prisma.product.create({
          data: {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            image: imageUrl, // Gunakan URL relatif yang baru dibuat
            category: {
              connect: { id: Number(category) },
            },
          },
        });
        
        return NextResponse.json(newProduct);
      } catch (fileError) {
        console.error("File Upload Error:", fileError);
        return NextResponse.json({ error: "Gagal mengunggah file gambar" }, { status: 500 });
      }
    } 
    // Handle JSON (backward compatibility)
    else {
      const body = await req.json();
      const { name, description, price, stock, category, image } = body;
      
      if (!name || !description || price == null || stock == null || !category || !image) {
        return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
      }
      
      if (!/^https?:\/\//.test(image) && !image.startsWith('/uploads/')) {
        return NextResponse.json({ error: "URL gambar tidak valid" }, { status: 400 });
      }
      
      const newProduct = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          image,
          category: {
            connect: { id: Number(category) },
          },
        },
      });
      
      return NextResponse.json(newProduct);
    }
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update a product
// PUT: Update a product
export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Handle FormData (untuk update dengan file baru)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      // Mendapatkan data produk
      const id = formData.get('id') as string;
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const price = formData.get('price') as string;
      const stock = formData.get('stock') as string;
      const category = formData.get('category') as string;
      const imageFile = formData.get('image') as File | null;
      
      // Validasi data dasar
      if (!id || !name || !description || !price || !stock || !category) {
        return NextResponse.json({ error: "Semua field wajib diisi kecuali gambar" }, { status: 400 });
      }
      
      let imageUrl;
      
      // Jika ada file gambar baru, simpan
      if (imageFile && imageFile instanceof File) {
        // Membuat direktori uploads jika belum ada
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        
        // Membuat nama file unik dengan UUID
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        
        // Konversi file ke array buffer dan simpan
        const fileBuffer = await imageFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(fileBuffer));
        
        // URL untuk gambar (relatif ke public directory)
        imageUrl = `/uploads/${fileName}`;
      } else {
        // Jika tidak ada file baru, gunakan URL gambar yang ada
        const existingProduct = await prisma.product.findUnique({
          where: { id: Number(id) },
          select: { image: true },
        });
        
        if (!existingProduct) {
          return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
        }
        
        imageUrl = existingProduct.image;
      }
      
      // Update data produk di database
      const updatedProduct = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          image: imageUrl,
          categoryId: Number(category), // Fix: connect via categoryId directly
        },
      });
      
      return NextResponse.json(updatedProduct);
    }
    // Handle JSON (backward compatibility)
    else {
      const body = await req.json();
      const { id, name, description, price, stock, category, image } = body;
      
      if (!id || !name || !description || price == null || stock == null || !category) {
        return NextResponse.json({ error: "Semua field wajib diisi kecuali gambar" }, { status: 400 });
      }
      
      // Only validate image URL if it's provided
      if (image && !/^https?:\/\//.test(image) && !image.startsWith('/uploads/')) {
        return NextResponse.json({ error: "URL gambar tidak valid" }, { status: 400 });
      }
      
      // If no image is provided, use the existing one
      let imageUrl = image;
      if (!image) {
        const existingProduct = await prisma.product.findUnique({
          where: { id: Number(id) },
          select: { image: true },
        });
        
        if (!existingProduct) {
          return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
        }
        
        imageUrl = existingProduct.image;
      }
      
      const updatedProduct = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          image: imageUrl,
          categoryId: Number(category), // Fix: connect via categoryId directly
        },
      });
      
      return NextResponse.json(updatedProduct);
    }
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Produk tidak ditemukan atau terjadi kesalahan" }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID produk wajib diisi" }, { status: 400 });
    }
    
    const deletedProduct = await prisma.product.delete({
      where: { id: Number(id) },
    });
    
    return NextResponse.json(deletedProduct);
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Produk tidak ditemukan atau terjadi kesalahan" }, { status: 500 });
  }
}