"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { X, User, History, Settings, LogOut, Zap, Calendar, Clock, ExternalLink, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Tab = 'profile' | 'history' | 'settings'

interface UserProfile {
    id: string
    email: string
    subscription_tier: string
    energy_credits: number
    max_energy: number
    created_at: string
    total_activities: number
}

interface Activity {
    id: string
    activity_type: string
    metadata: any
    created_at: string
}

export function AccountModal({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchProfile()
        if (activeTab === 'history') {
            fetchHistory()
        }
    }, [activeTab])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/user/history?limit=10')
            if (res.ok) {
                const data = await res.json()
                setActivities(data.activities)
            }
        } catch (error) {
            console.error('Failed to fetch history:', error)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    const handleClearHistory = async () => {
        if (!confirm('Clear all activity history? This cannot be undone.')) return

        try {
            const res = await fetch('/api/user/history', { method: 'DELETE' })
            if (res.ok) {
                setActivities([])
            }
        } catch (error) {
            console.error('Failed to clear history:', error)
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'tool_view': return <ExternalLink className="w-4 h-4" />
            case 'vault_save': return <Zap className="w-4 h-4" />
            case 'ai_interaction': return <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    const getActivityLabel = (activity: Activity) => {
        const { activity_type, metadata } = activity

        switch (activity_type) {
            case 'tool_view':
                return `Viewed ${metadata.tool_name || 'tool'}`
            case 'vault_save':
                return `Saved ${metadata.tool_name || 'tool'} to vault`
            case 'vault_share':
                return `Shared vault collection`
            case 'ai_interaction':
                return `Used ${metadata.feature || 'AI feature'}`
            case 'runway_view':
                return `Viewed ${metadata.item_name || 'trending item'}`
            default:
                return 'Unknown activity'
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="bg-white rounded-[3rem] relative overflow-hidden font-sans border-0 shadow-2xl max-w-2xl mx-auto w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white font-black text-xl relative">
                        {profile?.email?.[0].toUpperCase() || 'U'}
                        {profile && profile.energy_credits > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-zinc-900 text-xs font-black">
                                {profile.energy_credits}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Account</h2>
                        <p className="text-sm text-zinc-400 font-medium">{profile?.email || 'Loading...'}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full w-10 h-10 hover:bg-zinc-100"
                >
                    <X className="w-5 h-5 text-zinc-900" />
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-100 px-8">
                {[
                    { id: 'profile', icon: User, label: 'Profile' },
                    { id: 'history', icon: History, label: 'History' },
                    { id: 'settings', icon: Settings, label: 'Settings' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-4 py-4 font-bold text-sm transition-all relative ${activeTab === tab.id
                                ? 'text-zinc-900'
                                : 'text-zinc-400 hover:text-zinc-600'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && profile && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-50 p-6 rounded-2xl">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-2">
                                        <Zap className="w-4 h-4" />
                                        Energy Credits
                                    </div>
                                    <div className="text-3xl font-black text-zinc-900">
                                        {profile.energy_credits}<span className="text-zinc-400">/{profile.max_energy}</span>
                                    </div>
                                </div>
                                <div className="bg-zinc-50 p-6 rounded-2xl">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-2">
                                        <History className="w-4 h-4" />
                                        Total Activity
                                    </div>
                                    <div className="text-3xl font-black text-zinc-900">{profile.total_activities}</div>
                                </div>
                            </div>

                            <div className="bg-zinc-50 p-6 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                                    <Calendar className="w-4 h-4" />
                                    Member Since
                                </div>
                                <div className="text-xl font-bold text-zinc-900">
                                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-zinc-900 to-zinc-700 p-6 rounded-2xl text-white">
                                <div className="text-sm font-medium opacity-80 mb-1">Subscription Tier</div>
                                <div className="text-2xl font-black uppercase">{profile.subscription_tier}</div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-zinc-900">Recent Activity</h3>
                                {activities.length > 0 && (
                                    <Button
                                        onClick={handleClearHistory}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            {activities.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400">
                                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-medium">No activity yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-zinc-900 shadow-sm">
                                                {getActivityIcon(activity.activity_type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-zinc-900">
                                                    {getActivityLabel(activity)}
                                                </div>
                                                <div className="text-xs text-zinc-400">
                                                    {formatDate(activity.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-black text-zinc-900 mb-4">Settings</h3>

                            <Button
                                onClick={handleLogout}
                                className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg flex items-center justify-center gap-3"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </Button>

                            <p className="text-xs text-zinc-400 text-center mt-4">
                                More settings coming soon
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
