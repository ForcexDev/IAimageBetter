import { useState, useRef, useEffect } from "react"
import { Card } from "./ui/card"
import { useLanguage } from "../lib/i18n.jsx"

export function ImageComparison({ before, after }) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const containerRef = useRef(null)
    const isDragging = useRef(false)
    const { t } = useLanguage()

    const handleMove = (clientX) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100)
        setSliderPosition(percentage)
    }

    const handleMouseDown = () => {
        isDragging.current = true
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    const handleMouseMove = (e) => {
        if (isDragging.current) {
            handleMove(e.clientX)
        }
    }

    const handleTouchMove = (e) => {
        handleMove(e.touches[0].clientX)
    }

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousemove', handleMouseMove)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <Card className="overflow-hidden bg-card border border-border">
            <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm lg:text-xl font-medium text-center">
                    {t('enhancedSuccess')}
                </h3>
                <p className="text-xs lg:text-base text-muted-foreground text-center mt-0.5">
                    {t('dragToCompare')}
                </p>
            </div>

            <div
                ref={containerRef}
                className="relative aspect-video cursor-ew-resize select-none bg-black/5"
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
            >
                {/* After image (full) */}
                <img
                    src={after}
                    alt="Enhanced"
                    className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Before image (clipped) */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                >
                    <img
                        src={before}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
                    />
                </div>

                {/* Slider line */}
                <div
                    className="absolute top-0 bottom-0 w-px bg-white/80 cursor-ew-resize z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110">
                        <div className="flex gap-0.5 lg:gap-1">
                            <div className="w-0.5 lg:w-1 h-3 lg:h-5 bg-neutral-400 rounded-full"></div>
                            <div className="w-0.5 lg:w-1 h-3 lg:h-5 bg-neutral-400 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] lg:text-sm px-2 lg:px-4 py-0.5 lg:py-1 rounded-full font-medium">
                    {t('before')}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-black text-[10px] lg:text-sm px-2 lg:px-4 py-0.5 lg:py-1 rounded-full font-medium shadow-sm">
                    {t('after')}
                </div>
            </div>
        </Card>
    )
}
