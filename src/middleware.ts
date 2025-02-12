import { NextResponse } from 'next/server'
import { NextRequest, userAgent } from 'next/server'

export function middleware(request: NextRequest) {
  // First check if all params already exist to avoid unnecessary processing
  const { searchParams } = request.nextUrl
  if (
    searchParams.has('browser') &&
    searchParams.has('os') &&
    searchParams.has('osVersion')
  ) {
    return NextResponse.next()
  }

  // Get current URL
  const url = request.nextUrl.clone()

  try {
    // Parse user agent using Next.js built-in utility
    const { browser, os } = userAgent(request)

    // Get browser info
    const browserName = browser.name?.toLowerCase() || 'unknown'

    // Get OS info
    const osName = os.name?.toLowerCase() || 'unknown'
    const osVersion = os.version || 'unknown'

    // Add parameters to existing search params
    url.searchParams.set('browser', browserName)
    url.searchParams.set('os', osName)
    url.searchParams.set('osVersion', osVersion)

    if (
      browserName === 'instagram' &&
      osName === 'ios' &&
      parseFloat(osVersion) >= 17
    ) {
      // Create new URL with x-safari-https protocol
      const safariUrl = `x-safari-https://${url.host}${url.pathname}${url.search}${url.hash}`
      return NextResponse.redirect(safariUrl)
    }

    // Redirect to same path with added parameters
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error parsing user agent:', error)
    // Continue with the request if parsing fails
    return NextResponse.next()
  }
}

// Configure which paths should trigger middleware
export const config = {
  matcher: [
    // Match all paths except static files, api routes, and existing browser/os params
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Don't run middleware if browser and os params already exist
    '/((?!.*browser=.*os=.*osVersion=).*)'
  ]
}
