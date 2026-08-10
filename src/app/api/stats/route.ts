import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalCertificates = await prisma.certificate.count();
    const verifiedCertificates = await prisma.certificate.count({ where: { revoked: false } });
    const revokedCertificates = await prisma.certificate.count({ where: { revoked: true } });

    const totalProducts = await prisma.product.count();
    const totalNFTs = await prisma.nFT.count();
    const activeListings = await prisma.marketplaceListing.count({ where: { active: true } });
    const totalLoans = await prisma.loan.count();
    const totalProposals = await prisma.proposal.count();

    const listings = await prisma.marketplaceListing.findMany();
    const totalMarketplaceVolume = listings.reduce((acc, l) => acc + parseFloat(l.price || "0"), 0);

    return NextResponse.json({
      totalCertificates,
      verifiedCertificates,
      revokedCertificates,
      totalProducts,
      totalNFTs,
      activeListings,
      totalLoans,
      totalProposals,
      totalMarketplaceVolume: totalMarketplaceVolume.toFixed(2),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
