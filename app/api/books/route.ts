import { NextResponse } from "next/server";

export async function GET() {
	// placeholder books endpoint
	return NextResponse.json({ books: [] });
}

export async function POST(request: Request) {
	// not implemented: return 501
	return new NextResponse(JSON.stringify({ error: "Not implemented" }), { status: 501 });
}
