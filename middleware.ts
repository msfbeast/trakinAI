import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Only protect the Curator API
    if (request.nextUrl.pathname.startsWith('/api/curate')) {
        const authHeader = request.headers.get('x-admin-secret');
        const secret = process.env.ADMIN_SECRET;

        // If no secret is set in env, we fail open (or closed) - let's fail closed for security
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

    return NextResponse.next()
}

export const config = {
    matcher: '/api/curate',
}
