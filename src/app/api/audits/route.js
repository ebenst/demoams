import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const audits = await prisma.audit.findMany({
      include: { asset: true },
      orderBy: { date: "desc" }
    });
    return NextResponse.json(audits);
  } catch (error) {
    return NextResponse.json({ error: "Gagal: " + error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Silakan masuk!" }, { status: 401 });
    }

    const body = await request.json();
    const { assetId, condition, pic, photoUrl, date } = body;

    const newAudit = await prisma.audit.create({
      data: {
        assetId,
        condition,
        pic,
        photoUrl,
        date: date ? new Date(date) : new Date(),
        userId: session.user.id
      }
    });

    const matchedAssetStatus = condition === "Maintenance" ? "Maintenance" : "Active";
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: matchedAssetStatus,
        description: "Audit Fisik: Diperiksa pada " + new Date().toLocaleDateString('id-ID') + " dengan kondisi " + condition + " oleh " + pic + "."
      }
    });

    return NextResponse.json(newAudit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal: " + error.message }, { status: 500 });
  }
}