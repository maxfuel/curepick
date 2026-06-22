import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { translateText } from "@/lib/translation/google";

export const dynamic = "force-dynamic";

const VALID_LOCALES = ["en", "ko", "zh", "ja"] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

function isValidLocale(v: string | null): v is ValidLocale {
  return VALID_LOCALES.includes(v as ValidLocale);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const locale = searchParams.get("locale");

  if (!type || !["review", "comment"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
  }
  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  if (type === "review") {
    // 1. Cache hit
    const { data: cached, error: cacheError } = await supabase
      .from("review_translations")
      .select("title, content")
      .eq("review_id", id)
      .eq("locale", locale)
      .single();
    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("review_translations cache lookup failed:", cacheError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (cached) return NextResponse.json(cached);

    // 2. Fetch original
    const { data: review } = await supabase
      .from("reviews")
      .select("title, content")
      .eq("id", id)
      .eq("status", "approved")
      .single();
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // 3. Translate + cache
    try {
      const [translatedTitle, translatedContent] = await Promise.all([
        translateText(review.title, locale),
        translateText(review.content, locale),
      ]);

      const { error: insertError } = await supabase
        .from("review_translations")
        .insert({
          review_id: id,
          locale,
          title: translatedTitle,
          content: translatedContent,
        });

      // 23505 = unique_violation (race condition — another request beat us to it)
      if (insertError && insertError.code !== "23505") {
        console.error("review_translations insert error:", insertError);
      }

      return NextResponse.json({
        title: translatedTitle,
        content: translatedContent,
      });
    } catch (err) {
      console.error("Translation failed:", err);
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 502 }
      );
    }
  } else {
    // type === "comment"
    const { data: cached, error: cacheError } = await supabase
      .from("review_comment_translations")
      .select("content")
      .eq("comment_id", id)
      .eq("locale", locale)
      .single();
    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("review_comment_translations cache lookup failed:", cacheError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (cached) return NextResponse.json(cached);

    const { data: comment } = await supabase
      .from("review_comments")
      .select("content")
      .eq("id", id)
      .single();
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    try {
      const translatedContent = await translateText(comment.content, locale);

      const { error: insertError } = await supabase
        .from("review_comment_translations")
        .insert({ comment_id: id, locale, content: translatedContent });

      if (insertError && insertError.code !== "23505") {
        console.error("review_comment_translations insert error:", insertError);
      }

      return NextResponse.json({ content: translatedContent });
    } catch (err) {
      console.error("Translation failed:", err);
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 502 }
      );
    }
  }
}
