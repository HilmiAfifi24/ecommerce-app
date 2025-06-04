// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'; // Pastikan path ini benar

export async function GET(
  request: NextRequest, // request tetap NextRequest
  context: { params: { id: string } } // Gunakan 'context' dan definisikan tipenya secara langsung
) {
  const { params } = context; // Destructure params dari context di sini
  const productId = parseInt(params.id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      // include: { category: true }, // Sertakan jika Anda ingin menampilkan nama kategori juga (misalnya di halaman edit)
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    // Sembunyikan detail error internal dari client di production
    return NextResponse.json({ error: "Failed to fetch product details. Please try again later." }, { status: 500 });
  }
}