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

        // 2. Set is_public = true (RLS ensures ownership)
        const { data, error } = await supabase
            .from('generations')
            .update({ is_public: true })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, is_public: true, url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${id}` })

    } catch (error) {
        console.error('Vault Share Error:', error)
        return NextResponse.json({ error: 'Failed to share' }, { status: 500 })
    }
}
