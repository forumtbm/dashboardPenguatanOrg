import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/setup"];

function configError(msg: string) {
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>Konfigurasi belum lengkap</title>
<body style="font-family:system-ui;max-width:640px;margin:60px auto;padding:0 16px;line-height:1.5">
<h2>Konfigurasi server belum lengkap</h2><p>${msg}</p>
<p>Periksa Vercel &rarr; Project &rarr; Settings &rarr; Environment Variables, lalu lakukan <b>Redeploy</b>.</p></body>`,
    { status: 500, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !key && "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(Boolean);
  if (missing.length) return configError(`Environment variable belum diisi: <b>${missing.join(", ")}</b>.`);
  if (!/^https:\/\/[^/\s"']+$/i.test(url!))
    return configError(
      `NEXT_PUBLIC_SUPABASE_URL tidak valid: <code>${url!.replace(/[<>&"]/g, "")}</code>. ` +
        `Formatnya harus persis <code>https://xxxxxxxx.supabase.co</code> (tanpa garis miring di akhir, tanpa /rest/v1, tanpa tanda kutip).`
    );

  const supabase = createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  let user = null;
  try {
    ({ data: { user } } = await supabase.auth.getUser());
  } catch (e) {
    return configError(`Tidak dapat menghubungi Supabase: ${String((e as Error).message).replace(/[<>&"]/g, "")}`);
  }
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
