import { createClient } from '@/lib/supabase/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Zap } from 'lucide-react'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

interface Props {
    params: { id: string }
}

async function getGeneration(id: string) {
    // Note: We use the admin client or a client that can read public items
    // Since we set up RLS for "public read access", a standard anon client works!
    const supabase = createClient()
    const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', id)
        .eq('is_public', true) // CRITICAL: Only fetch if public
        .single()

    if (error || !data) return null
    return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const generation = await getGeneration(params.id)
    if (!generation) return { title: 'Not Found' }

    const title = `Trakin.AI // ${generation.tool_id === 'deconstructor' ? 'Deconstructed' : 'Architected'} Intelligence`

    return {
        title,
        description: generation.output_text.slice(0, 160) + '...',
        openGraph: {
            title,
            description: generation.output_text.slice(0, 160) + '...',
            images: [`/api/og?id=${params.id}`], // The magic dynamic image
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description: generation.output_text.slice(0, 160) + '...',
            images: [`/api/og?id=${params.id}`],
        }
    }
}

export default async function SharePage({ params }: Props) {
    const generation = await getGeneration(params.id)

    if (!generation) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 relative overflow-hidden text-zinc-900 font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200 rounded-full blur-[120px] opacity-50" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="hover:bg-white rounded-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Trakin.AI
                        </Button>
                    </Link>
                    <div className="text-xl font-black tracking-tighter">TRAKIN.AI</div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-zinc-200 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-zinc-900 via-zinc-500 to-zinc-900" />

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-zinc-100 rounded-full">
                            <Zap className="w-5 h-5 text-zinc-900" />
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            {generation.tool_id} // RECORD #{generation.id.slice(0, 6)}
                        </div>
                    </div>

                    <div className="font-mono text-lg md:text-xl text-zinc-800 leading-relaxed whitespace-pre-wrap mb-8">
                        {generation.output_text}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-zinc-100">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            Generated via Gemini 2.0
                        </div>
                        <Button
                            className="rounded-full bg-zinc-900 text-white font-bold hover:bg-zinc-800"
                            onClick={() => {
                                // Need client component for onclick, or just link to home
                            }} asChild
                        >
                            <Link href="/">
                                Try it Yourself <ExternalLink className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    )
}
