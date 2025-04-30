import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";

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
    const body = await req.json();
    const { name, description, price, stock, category, image } = body;

    if (!name || !description || price == null || stock == null || !category || !image) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (!/^https?:\/\//.test(image)) {
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
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update a product
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, price, stock, category, image } = body;

    if (!id || !name || !description || price == null || stock == null || !category || !image) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (!/^https?:\/\//.test(image)) {
      return NextResponse.json({ error: "URL gambar tidak valid" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
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

    return NextResponse.json(updatedProduct);
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
