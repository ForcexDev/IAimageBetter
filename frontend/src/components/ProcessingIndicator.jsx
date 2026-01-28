import { useState, useEffect, useMemo } from "react"
import { Progress } from "./ui/progress"
import { motion } from "framer-motion"
import { useLanguage } from "../lib/i18n.jsx"

// Legacy fallback based on file size
function getTimeMultiplierSimple(fileSizeBytes) {
    const sizeMB = fileSizeBytes / (1024 * 1024)
    if (sizeMB < 0.5) return 0.6
    if (sizeMB < 1) return 0.8
    if (sizeMB < 2) return 1.0
    if (sizeMB < 3) return 1.3
    return 1.5
}

export function ProcessingIndicator({ isActive, fileSize = 0, imageDims, scale = 4 }) {
    const [currentStage, setCurrentStage] = useState(0)
    const [progress, setProgress] = useState(0)
    const [started, setStarted] = useState(false)
    const { t } = useLanguage()

    // Calculate dynamic time multiplier based on pixels (preferred) or size
    const timeMultiplier = useMemo(() => {
        if (imageDims) {
            // Calculate Output Megapixels
            const outputMP = (imageDims.width * scale * imageDims.height * scale) / 1_000_000

            // Adjust speed factor based on output size
            if (outputMP < 4) return 0.5      // < 4MP output (very fast)
            if (outputMP < 16) return 1.0     // < 16MP output (normal 1080p->4k)
            if (outputMP < 36) return 2.0     // < 36MP output (large)
            return 4.0                        // Huge
        }
        return getTimeMultiplierSimple(fileSize)
    }, [fileSize, imageDims, scale])

    const STAGES = [
        { label: t('uploadingImage'), baseDuration: 1500 },
        { label: t('analyzingQuality'), baseDuration: 2000 },
        { label: t('applyingAI'), baseDuration: 3000 }, // Scaled by multiplier
        { label: t('finishing'), baseDuration: 1000 },
    ]

    useEffect(() => {
        if (!isActive) {
            setCurrentStage(0)
            setProgress(0)
            setStarted(false)
            return
        }

        if (!started) {
            setStarted(true)
            simulateProgress(0)
        }
    }, [isActive, started])

    const simulateProgress = (stageIndex) => {
        if (stageIndex >= STAGES.length) {
            // Cap at 95% until server responds
            setProgress(95)
            return
        }

        const stage = STAGES[stageIndex]
        const duration = stage.baseDuration * timeMultiplier
        setCurrentStage(stageIndex)

        const progressSteps = STAGES.length
        const progressPerStage = 90 / progressSteps
        const startProgress = stageIndex * progressPerStage
        const endProgress = (stageIndex + 1) * progressPerStage

        const steps = 20
        const stepDuration = duration / steps
        let step = 0

        const interval = setInterval(() => {
            step++
            // Easing function for smoother bar
            const factor = step / steps
            const smoothFactor = 1 - Math.pow(1 - factor, 3) // cubic out

            const newProgress = startProgress + (endProgress - startProgress) * smoothFactor
            setProgress(Math.min(newProgress, 95))

            if (step >= steps) {
                clearInterval(interval)
                // Move to next stage
                if (isActive) { // Check if still active
                    setTimeout(() => simulateProgress(stageIndex + 1), 50)
                }
            }
        }, stepDuration)

        return () => clearInterval(interval)
    }

    // Force complete on finish (when parent component signals completion or unmounts, 
    // but here we rely on isActive becoming false usually updates UI)
    // Actually we don't know when it finishes until isActive becomes false, 
    // at which point this component unmounts. 
    // But if we want to show 100%, we'd need a "completed" prop.
    // For now, the unmount handles the "disappearance".

    if (!isActive) return null

    // Estimate time text
    let estimatedSeconds = null
    if (imageDims) {
        const outputMP = (imageDims.width * scale * imageDims.height * scale) / 1_000_000
        // Rough heuristic: 0.25s per MP + 2s overhead
        estimatedSeconds = Math.round(outputMP * 0.25 + 2)
    } else if (fileSize > 0) {
        estimatedSeconds = Math.round((fileSize / (1024 * 1024)) * 3 + 2)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 lg:space-y-6 max-w-md lg:max-w-3xl mx-auto"
        >
            <div className="flex items-center justify-between text-xs lg:text-lg">
                <span className="text-muted-foreground flex items-center gap-2 lg:gap-4">
                    <span className="inline-block w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-primary animate-pulse"></span>
                    {STAGES[Math.min(currentStage, STAGES.length - 1)]?.label}
                </span>
                <span className="text-muted-foreground/70 tabular-nums font-mono text-xs lg:text-lg">
                    {Math.round(progress)}%
                </span>
            </div>
            <Progress value={progress} className="h-1.5 lg:h-3" />
            <p className="text-[10px] lg:text-sm text-muted-foreground/50 text-center uppercase tracking-wider">
                {estimatedSeconds
                    ? `~${estimatedSeconds}s ${t('processingTime').split(' ').slice(-3).join(' ')}`
                    : t('processingTime')
                }
            </p>
        </motion.div>
    )
}
