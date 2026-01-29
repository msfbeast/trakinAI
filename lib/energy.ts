import { createClient } from "@/lib/supabase/server"

export async function checkAndConsumeEnergy(userId: string) {
    const supabase = await createClient()

    // 1. Get Profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error || !profile) throw new Error("Profile not found")

    const now = new Date()
    const lastRefill = new Date(profile.last_energy_refill)
    const oneDay = 24 * 60 * 60 * 1000

    // 2. Check for Refill (It's been > 24h?)
    if (now.getTime() - lastRefill.getTime() > oneDay) {
        // Refill!
        await supabase
            .from('profiles')
            .update({
                energy_credits: profile.max_energy,
                last_energy_refill: now.toISOString()
            })
            .eq('id', userId)

        return true // Just refilled, so they have energy
    }

    // 3. Check Balance
    if (profile.energy_credits <= 0) {
        return false
    }

    // 4. Consume
    await supabase
        .from('profiles')
        .decrement('energy_credits', 1)
        .eq('id', userId)

    return true
}
