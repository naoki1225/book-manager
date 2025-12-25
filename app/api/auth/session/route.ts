import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session get error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "Missing tokens" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    
    // Supabaseのセッションクッキーを設定
    // クッキー名はSupabaseのデフォルトに合わせる
    const maxAge = 60 * 60 * 24 * 7; // 7日間
    
    cookieStore.set({
      name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
      value: JSON.stringify({
        access_token,
        refresh_token,
        expires_in: 3600,
        token_type: 'bearer',
      }),
      maxAge,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session setup error:", error);
    return NextResponse.json(
      { error: "Failed to set session" },
      { status: 500 }
    );
  }
}
