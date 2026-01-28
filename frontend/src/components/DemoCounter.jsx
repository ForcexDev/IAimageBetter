import { useEffect, useState } from "react"
import axios from "axios"
import { useLanguage } from "../lib/i18n.jsx"

export function DemoCounter({ onLimitReached }) {
    const [limits, setLimits] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const { t } = useLanguage()

    const fetchLimits = async () => {
        try {
            const baseUrl = import.meta.env.PROD ? "/api" : "http://localhost:8000/api"
            const res = await axios.get(`${baseUrl}/limits`)
            setLimits(res.data)
            setError(false)
            const blocked = res.data.global.is_exhausted || !res.data.user.can_try
            if (blocked && onLimitReached) onLimitReached(true)
        } catch (err) {
            console.error("Failed to fetch limits", err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLimits()
        const interval = setInterval(fetchLimits, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <span className="text-sm text-muted-foreground/60">•••</span>
        )
    }

    if (error) {
        return (
            <span className="inline-flex items-center gap-2 text-sm text-yellow-500/80">
                <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
                {t('serverOffline')}
            </span>
        )
    }

    if (!limits) return null

    const { global, user } = limits
    const isExhausted = global.is_exhausted || !user.can_try
    const remaining = global.total_limit - global.used

    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className={`inline-flex items-center gap-2 text-sm cursor-help transition-colors ${isExhausted ? 'text-red-400/80' : 'text-muted-foreground hover:text-foreground/80'}`}
            >
                <span className={`w-2 h-2 rounded-full ${isExhausted ? 'bg-red-400' : 'bg-green-500/80'}`}></span>
                {remaining} {t('demosAvailable')}
                <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 p-4 bg-card border border-border rounded-lg shadow-xl z-50 text-left">
                    <p className="text-sm text-foreground font-medium mb-2">
                        {t('whyLimit')}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('limitExplanation')}
                    </p>
                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground/70">
                        {t('resetsAt')}
                    </div>
                </div>
            )}
        </div>
    )
}
