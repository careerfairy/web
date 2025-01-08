import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PUBLIC_FILE = /\.(.*)$/
const LEVELS_PATH = "/levels"

export function middleware(request: NextRequest) {
   const url = request.nextUrl
   console.log("🚀 ~ file: middleware.ts:9 ~ middleware ~ url:", url)
   const locale = url.locale
   console.log("🚀 ~ file: middleware.ts:10 ~ middleware ~ locale:", locale)
   const pathname = url.pathname
   const search = url.search

   console.log("\n=== Middleware Start ===")
   console.log("🔍 Processing URL:", pathname + search)
   console.log("🌐 Locale from URL:", locale)

   // Skip middleware for static files and API routes
   if (
      PUBLIC_FILE.test(pathname) ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api")
   ) {
      console.log("⏭️ Skipping middleware for static/api file")
      return NextResponse.next()
   }

   // Check if this is a levels path
   const isLevelsPath = pathname.startsWith(LEVELS_PATH)

   // For levels paths, do nothing and let Next.js handle localization
   if (isLevelsPath) {
      console.log(
         "✨ Levels path detected, letting Next.js handle localization"
      )
      return NextResponse.next()
   }

   // For all other paths, remove locale prefix if it exists
   if (locale === "de") {
      const pathWithoutLocale = pathname.replace(`/${locale}`, "")
      const redirectUrl = new URL(pathWithoutLocale, request.url)
      console.log(
         "🔄 Removing locale prefix, redirecting to:",
         pathWithoutLocale
      )
      return NextResponse.redirect(redirectUrl, 308)
   }

   console.log("✅ Proceeding with request:", pathname)
   return NextResponse.next()
}

export const config = {
   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
