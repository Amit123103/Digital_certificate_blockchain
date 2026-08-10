import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { productId: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateId: product.certificateId },
    });

    const supplyChain = await prisma.supplyChainEvent.findMany({
      where: { productId: product.productId },
      orderBy: { timestamp: "asc" },
    });

    const nft = await prisma.nFT.findUnique({
      where: { productId: product.productId },
    });

    return NextResponse.json({ product, certificate, supplyChain, nft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
