import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { userId } = await params;

  // 認証不要で特定ユーザーの投稿を取得
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, book_title, book_author, reading_status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (postsError) {
    return NextResponse.json(
      { error: postsError.message },
      { status: 400 }
    );
  }

  // ニックネームはクライアント側で別途取得するか、URLパラメータで渡す
  // ここでは投稿データのみ返す
  return NextResponse.json({
    posts: posts || [],
  });
}
