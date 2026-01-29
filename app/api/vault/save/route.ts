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
        const body = await request.json()
        const { tool_id, input_data, output_text } = body

        // 2. Validation
        if (!tool_id || !output_text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 3. Insert into Vault
        const { data, error } = await supabase
            .from('generations')
            .insert({
                user_id: user.id,
                tool_id,
                input_data,
                output_text
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, entry: data })

    } catch (error) {
        console.error('Vault Save Error:', error)
        return NextResponse.json({ error: 'Failed to save to vault' }, { status: 500 })
    }
}
