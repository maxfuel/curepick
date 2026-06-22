import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. Run next-intl middleware first
  const intlResponse = intlMiddleware(request);

  // 2. Refresh Supabase auth session on the intl response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            intlResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This refreshes the session if expired
  await supabase.auth.getUser();

  return intlResponse;
}

export default proxy;

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
