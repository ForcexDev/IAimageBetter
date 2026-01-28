import { Button } from "./ui/button"
import { Download, Share2 } from "lucide-react"
import { useLanguage } from "../lib/i18n.jsx"

export function ControlPanel({ onDownload, isProcessing }) {
    const { t } = useLanguage()

    return (
        <div className="mt-4 flex items-center justify-center gap-3">
            <Button
                onClick={onDownload}
                disabled={isProcessing}
                className="bg-foreground text-background hover:bg-foreground/90 gap-2 text-sm font-medium px-5"
            >
                <Download className="w-4 h-4" />
                {t('download')}
            </Button>

            <Button
                variant="outline"
                disabled={isProcessing}
                className="gap-2 border-border hover:bg-secondary text-sm"
            >
                <Share2 className="w-4 h-4" />
                {t('share')}
            </Button>
        </div>
    )
}
