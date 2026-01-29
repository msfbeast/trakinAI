import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/user/history
 * Fetch user activity history (paginated)
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')
        const type = searchParams.get('type') // Optional filter by activity type

        // Build query
        let query = supabase
            .from('activity_history')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        // Apply type filter if provided
        if (type) {
            query = query.eq('activity_type', type)
        }

        const { data: activities, error, count } = await query

        if (error) {
            throw error
        }

        return NextResponse.json({
            activities: activities || [],
            total: count || 0,
            hasMore: (count || 0) > offset + limit
        })

    } catch (error) {
        console.error('History fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/user/history
 * Log a new activity
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { activity_type, metadata = {} } = body

        // Validate activity type
        const validTypes = ['tool_view', 'vault_save', 'vault_share', 'ai_interaction', 'runway_view']
        if (!validTypes.includes(activity_type)) {
            return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
        }

        // Insert activity
        const { data, error } = await supabase
            .from('activity_history')
            .insert({
                user_id: user.id,
                activity_type,
                metadata
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('Activity log error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/user/history
 * Clear user history (optionally before a timestamp)
 */
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const before = searchParams.get('before') // Optional timestamp

        let query = supabase
            .from('activity_history')
            .delete()
            .eq('user_id', user.id)

        // If 'before' timestamp provided, only delete older activities
        if (before) {
            query = query.lt('created_at', before)
        }

        const { error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('History delete error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
