import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET: Tampilkan semua produk
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Tambah produk baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, stock, image } = body;

    // Validasi sederhana
    if (!name || !description || !price || !stock || !image) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Validasi URL gambar
    if (!image.startsWith("http://") && !image.startsWith("https://")) {
      return NextResponse.json({ error: "URL gambar tidak valid" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update produk
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, price, stock, image } = body;

    if (!id || !name || !description || !price || !stock || !image) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (!image.startsWith("http://") && !image.startsWith("https://")) {
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
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Hapus produk
export async function DELETE(req: Request) {
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
