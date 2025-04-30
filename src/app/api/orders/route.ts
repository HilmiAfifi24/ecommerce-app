import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

// Function untuk membuat order baru
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Mendapatkan data dari body request
    const { userId, products } = req.body;

    // Validasi input
    if (!userId || !products || products.length === 0) {
      return res.status(400).json({ message: "UserId dan produk diperlukan" });
    }

    try {
      // Menghitung total harga produk
      const total = products.reduce((acc: number, product: { id: number, quantity: number, price: number }) => {
        return acc + product.quantity * product.price;
      }, 0);

      // Membuat order baru di database
      const order = await prisma.order.create({
        data: {
          userId, // userId yang melakukan order
          total,   // total harga
          orderItems: {
            create: products.map((product: { id: number, quantity: number, price: number }) => ({
              productId: product.id,
              quantity: product.quantity,
              price: product.price,
            })),
          },
        },
        include: {
          orderItems: true, // Mengambil data order items yang baru dibuat
        },
      });

      // Update stok produk setelah order berhasil
      for (const product of products) {
        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            stock: {
              decrement: product.quantity, // Mengurangi stok berdasarkan quantity yang dipesan
            },
          },
        });
      }

      // Mengirimkan response dengan data order yang telah dibuat
      return res.status(201).json(order);
    } catch (error) {
      console.error("Failed to create order", error);
      return res.status(500).json({ message: "Terjadi kesalahan saat membuat order" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
