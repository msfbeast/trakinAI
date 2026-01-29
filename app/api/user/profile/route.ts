import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/user/profile
 * Fetch current user profile with activity statistics
 */
export async function GET() {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch profile with activity counts
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Get activity statistics
        const { count: totalActivities } = await supabase
            .from('activity_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        return NextResponse.json({
            ...profile,
            total_activities: totalActivities || 0
        })

    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/user/profile
 * Update user preferences
 */
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { preferences } = body

        // Update profile (if we add preferences column later)
        // For now, just return success
        return NextResponse.json({ success: true, preferences })

    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
