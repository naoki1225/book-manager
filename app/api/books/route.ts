import { NextResponse } from "next/server";

// Minimal GET handler so this file is a valid module during build.
// Extend this as needed (e.g., proxy to Open Library or query Supabase).
export async function GET() {
	return NextResponse.json({ status: "ok", message: "books endpoint" });
}
