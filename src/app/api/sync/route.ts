import { NextResponse } from "next/server";
import { syncBlockchainStateToDB } from "@/services/indexer";

export async function POST() {
  try {
    await syncBlockchainStateToDB();
    return NextResponse.json({ success: true, message: "Blockchain indexer sync executed" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
