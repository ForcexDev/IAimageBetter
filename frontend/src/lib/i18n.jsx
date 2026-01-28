import { createContext, useContext, useState, useEffect } from 'react'

const translations = {
    en: {
        // Header
        subtitle: "AI-powered image enhancement. Professional results.",
        demosAvailable: "demos available today",

        // Demo counter
        serverOffline: "Server offline",

        // Tooltip
        whyLimit: "Why is there a limit?",
        limitExplanation: "AI image processing consumes a lot of server resources. To keep the service free and available for everyone, we limit daily enhancements.",
        resetsAt: "Resets at 00:00 UTC",

        // Uploader
        uploadImage: "Upload image",
        dropHere: "Drop here",
        dragOrClick: "Drag & drop or click to browse",
        maxSize: "JPG, PNG, WebP • Max 50MB",

        // Processing
        uploadingImage: "Uploading image...",
        analyzingQuality: "Analyzing quality...",
        applyingAI: "Applying AI...",
        finishing: "Finishing...",
        processingTime: "Processing may take 30-60 seconds depending on the image",

        // Comparison
        enhancedSuccess: "Enhanced successfully",
        dragToCompare: "Drag to compare",
        before: "Before",
        after: "After",

        // Controls
        download: "Download",
        share: "Share",
        enhanceAnother: "← Enhance another",

        // Limit reached
        limitReached: "Limit reached",
        dailyDemosExhausted: "Daily demos exhausted. Come back tomorrow.",

        // Options
        resolutionTitle: "Upscale Factor",
        resolution2x: "2x (Faster)",
        resolution4x: "4x (Best Quality)",
        originalSize: "Input",
        outputSize: "Output",

        // Errors
        fileTooLarge: "File too large. Maximum size is 50MB",

        // Footer
        poweredBy: "Powered by Real-ESRGAN"
    },
    es: {
        // Header
        subtitle: "Mejora de imágenes con IA. Resultados profesionales.",
        demosAvailable: "demos disponibles hoy",

        // Demo counter
        serverOffline: "Servidor offline",

        // Tooltip
        whyLimit: "¿Por qué hay límite?",
        limitExplanation: "El procesamiento de imágenes con IA consume muchos recursos del servidor. Para mantener el servicio gratuito y disponible para todos, limitamos las mejoras diarias.",
        resetsAt: "Se reinicia a las 00:00 UTC",

        // Uploader
        uploadImage: "Subir imagen",
        dropHere: "Suelta aquí",
        dragOrClick: "Arrastra o haz clic para buscar",
        maxSize: "JPG, PNG, WebP • Máx 50MB",

        // Errors
        fileTooLarge: "Archivo demasiado grande. El tamaño máximo es 50MB",

        // Processing
        uploadingImage: "Subiendo imagen...",
        analyzingQuality: "Analizando calidad...",
        applyingAI: "Aplicando IA...",
        finishing: "Finalizando...",
        processingTime: "El procesamiento puede tardar 30-60 segundos según la imagen",

        // Comparison
        enhancedSuccess: "Mejorado exitosamente",
        dragToCompare: "Arrastra para comparar",
        before: "Antes",
        after: "Después",

        // Controls
        download: "Descargar",
        share: "Compartir",
        enhanceAnother: "← Mejorar otra",

        // Limit reached
        limitReached: "Límite alcanzado",
        dailyDemosExhausted: "Demos diarios agotados. Vuelve mañana.",

        // Options
        resolutionTitle: "Factor de escala",
        resolution2x: "2x (Más rápido)",
        resolution4x: "4x (Mejor Calidad)",
        originalSize: "Entrada",
        outputSize: "Salida",

        // Footer
        poweredBy: "Impulsado por Real-ESRGAN"
    }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Try to get from localStorage or use browser language
        const saved = localStorage.getItem('iaimagebetter-lang')
        if (saved) return saved
        const browserLang = navigator.language.split('-')[0]
        return browserLang === 'es' ? 'es' : 'en'
    })

    useEffect(() => {
        localStorage.setItem('iaimagebetter-lang', language)
    }, [language])

    const t = (key) => translations[language][key] || key

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'es' : 'en')
    }

    return (
        <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}

export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage()

    return (
        <button
            onClick={toggleLanguage}
            className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary/80 hover:bg-secondary border border-border rounded-full transition-colors"
            title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
        >
            <span className="text-sm">{language === 'en' ? '🇺🇸' : '🇪🇸'}</span>
            <span className="uppercase">{language}</span>
        </button>
    )
}
