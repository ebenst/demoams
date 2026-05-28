// src/app/api/assets/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // sesuaikan dengan jalur prisma instance Anda

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "Semua";

  try {
    const whereClause = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { serial: { contains: search, mode: "insensitive" } }
      ]
    };

    // Jika filter kategori dipilih selain 'Semua'
    if (category !== "Semua") {
      whereClause.categoryName = category; // atau relasi category: { name: category }
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      orderBy: { id: "desc" }
    });

    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}