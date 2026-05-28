import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, categoryName, status, nextMaintenance, purchaseDate, price, description } = body;

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        categoryName,
        status,
        description,
        price: price ? parseFloat(price) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined
      }
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Hanya admin" }, { status: 403 });
    }

    const { id } = params;
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ message: "Aset berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}