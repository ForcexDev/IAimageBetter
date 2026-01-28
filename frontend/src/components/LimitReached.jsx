import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { Card } from "./ui/card"
import { useLanguage } from "../lib/i18n.jsx"

export function LimitReached() {
    const { t } = useLanguage()

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-8"
        >
            <Card className="max-w-sm mx-auto p-6 bg-card border border-border">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary rounded-full mb-4">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                </div>

                <h2 className="text-lg font-medium mb-2">{t('limitReached')}</h2>
                <p className="text-muted-foreground text-sm mb-4">
                    {t('dailyDemosExhausted')}
                </p>

                <div className="flex items-center justify-between text-xs bg-secondary rounded px-3 py-2">
                    <span className="text-muted-foreground">{t('resetsAt').split(' ')[0]}</span>
                    <span className="font-mono">00:00 UTC</span>
                </div>
            </Card>
        </motion.div>
    )
}
