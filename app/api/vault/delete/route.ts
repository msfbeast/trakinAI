import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
        }

        // 2. Delete (RLS will ensure they can only delete their own)
        const { error } = await supabase
            .from('generations')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Double check for safety, though RLS handles it

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Vault Delete Error:', error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
