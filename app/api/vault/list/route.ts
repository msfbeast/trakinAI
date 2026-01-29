import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 2. Fetch History
        const { data, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50) // Cap at 50 for now

        if (error) throw error

        return NextResponse.json({ generations: data })

    } catch (error) {
        console.error('Vault List Error:', error)
        return NextResponse.json({ error: 'Failed to fetch vault' }, { status: 500 })
    }
}
