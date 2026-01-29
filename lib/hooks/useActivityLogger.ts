/**
 * Activity logging utility hook
 * Provides a simple interface to log user activities
 */

'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type ActivityType = 'tool_view' | 'vault_save' | 'vault_share' | 'ai_interaction' | 'runway_view'

interface ActivityMetadata {
    [key: string]: any
}

export function useActivityLogger() {
    const supabase = createClient()

    const logActivity = useCallback(async (
        activityType: ActivityType,
        metadata: ActivityMetadata = {}
    ) => {
        try {
            // Check if user is authenticated
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Silently skip logging for unauthenticated users
                return
            }

            // Log activity via API
            await fetch('/api/user/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity_type: activityType,
                    metadata
                })
            })

        } catch (error) {
            // Silently fail - logging shouldn't break the app
            console.debug('Activity logging skipped:', error)
        }
    }, [])

    return { logActivity }
}

// Debounced version for frequent events
export function useDebouncedActivityLogger(delay = 1000) {
    const { logActivity } = useActivityLogger()
    let timeoutId: NodeJS.Timeout | null = null

    const debouncedLog = useCallback((
        activityType: ActivityType,
        metadata: ActivityMetadata = {}
    ) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            logActivity(activityType, metadata)
        }, delay)
    }, [logActivity, delay])

    return { logActivity: debouncedLog }
}
