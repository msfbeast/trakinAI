import { MetadataRoute } from 'next'
import { getTools } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const tools = await getTools()
    const baseUrl = 'https://trakin.ai' // Placeholder URL - swap for real domain

    // Base routes
    const routes = [
        '',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic Tool routes (if we had individual pages, which we will)
    // For now, the index is the main attraction.

    return [...routes]
}
