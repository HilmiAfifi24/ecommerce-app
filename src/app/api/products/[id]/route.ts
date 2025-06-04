// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      // include: { category: true }, // Sertakan jika Anda ingin menampilkan nama kategori juga
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 });
  }
}