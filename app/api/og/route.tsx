import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/client'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return new Response('Missing ID', { status: 400 })

        const supabase = createClient()
        const { data: generation } = await supabase
            .from('generations')
            .select('*')
            .eq('id', id)
            .single()

        if (!generation) {
            return new Response('Not Found', { status: 404 })
        }

        const text = generation.output_text.slice(0, 300) + (generation.output_text.length > 300 ? '...' : '')
        const tool = generation.tool_id.toUpperCase()

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#09090b', // Zinc 950
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        padding: '40px 80px',
                        position: 'relative',
                    }}
                >
                    {/* Glowing Orb */}
                    <div style={{
                        position: 'absolute',
                        top: '-200px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                        filter: 'blur(80px)',
                    }} />

                    {/* Card Container */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#18181b', // Zinc 900
                        border: '1px solid #3f3f46', // Zinc 700
                        borderRadius: '32px',
                        padding: '60px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'space-between',
                    }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>TRAKIN.AI</span>
                                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '4px', color: '#71717a' }}>THE INDEX</span>
                            </div>
                            <div style={{
                                padding: '10px 20px',
                                backgroundColor: tool === 'DECONSTRUCTOR' ? '#14532d' : '#1e3a8a',
                                color: tool === 'DECONSTRUCTOR' ? '#86efac' : '#93c5fd',
                                borderRadius: '99px',
                                fontSize: 16,
                                fontWeight: 800,
                                letterSpacing: '2px'
                            }}>
                                {tool}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            fontSize: 32,
                            lineHeight: 1.4,
                            fontWeight: 500,
                            color: '#e4e4e7', // Zinc 200
                            whiteSpace: 'pre-wrap',
                            overflow: 'hidden',
                            display: 'flex',
                            flexGrow: 1,
                            alignItems: 'center', // Center vertically
                            margin: '40px 0',
                            fontFamily: 'monospace'
                        }}>
                            "{text}"
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '30px', width: '100%' }}>
                            <span style={{ fontSize: 20, color: '#52525b', fontWeight: 600 }}>POWERED BY GEMINI 2.0</span>
                            <span style={{ fontSize: 20, color: '#fff', fontWeight: 700 }}>trakin.ai</span>
                        </div>

                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
