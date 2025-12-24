import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  await supabase.from("posts").insert({
    book_title: body.bookTitle,
    book_author: body.bookAuthor,
    quote: body.quote,
  });

  return NextResponse.json({ ok: true });
}
