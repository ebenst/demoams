import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import qr from "qrcode";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    
    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { serial: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category && category !== "Semua") {
      whereClause.categoryName = category;
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil database aset: " + error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    const { name, categoryName, serial, purchaseDate, price, description } = body;

    const existingAsset = await prisma.asset.findUnique({ where: { serial } });
    if (existingAsset) {
      return NextResponse.json({ error: "Serial Number sudah terdaftar" }, { status: 400 });
    }

    const totalCount = await prisma.asset.count();
    const customId = "AST-" + String(totalCount + 1).padStart(3, "0");

    const newAsset = await prisma.asset.create({
      data: {
        id: customId,
        name,
        categoryName,
        serial,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        price: parseFloat(price) || 0,
        description,
        nextMaintenance: new Date(new Date().setMonth(new Date().getMonth() + 6))
      }
    });

    const qrDataURL = await qr.toDataURL(serial);
    return NextResponse.json({ ...newAsset, qrCode: qrDataURL }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal: " + error.message }, { status: 500 });
  }
}