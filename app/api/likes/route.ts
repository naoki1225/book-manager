import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({ likes: [] });
}

export async function POST(request: Request) {
	return new NextResponse(JSON.stringify({ error: "Not implemented" }), { status: 501 });
}
