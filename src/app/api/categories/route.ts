import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Tampilkan semua kategori
export async function GET() {
    try {
        const categories = await prisma.category.findMany();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Tambah kategori baru
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name } = body;

        // Validasi sederhana
        if (!name) {
            return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data: {
                name,
            },
        });

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// update category
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name } = body;

        if (!id || !name) {
            return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: { id: Number(id) },
            data: {
                name,
            },
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// delete category
export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID kategori wajib diisi" }, { status: 400 });
        }
        
        // Check if category exists
        const categoryExists = await prisma.category.findUnique({
            where: { id: Number(id) }
        });

        if (!categoryExists) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Check if there are related products
        const relatedProducts = await prisma.product.findMany({
            where: { categoryId: Number(id) }
        });

        // If there are related products, return an error
        if (relatedProducts.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete category with related products. Remove products first." }, 
                { status: 400 }
            );
        }

        const deletedCategory = await prisma.category.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json(deletedCategory);
    } catch (error) {
        console.error("DELETE Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
    }
}