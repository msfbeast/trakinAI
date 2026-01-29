import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // IMPORTANT: specific to Supabase Auth - refreshing the session!
    const {
        data: { user },
    } = await supabase.auth.getUser()


    // --- 🛡️ EXISTING SECURITY LAYER: Curator API Protection ---
    if (request.nextUrl.pathname.startsWith('/api/curate')) {
        const authHeader = request.headers.get('x-admin-secret');
        const secret = process.env.ADMIN_SECRET;

        // Fail closed if no secret is configured
        if (!secret) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'Server configuration error: ADMIN_SECRET not set' }),
                { status: 500, headers: { 'content-type': 'application/json' } }
            )
        }

        if (authHeader !== secret) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'Unauthorized Access' }),
                { status: 401, headers: { 'content-type': 'application/json' } }
            )
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
