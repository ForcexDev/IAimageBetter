import { useState } from "react"
import axios from "axios"
import { DemoCounter } from "./components/DemoCounter"
import { ImageUploader } from "./components/ImageUploader"
import { ImageComparison } from "./components/ImageComparison"
import { LimitReached } from "./components/LimitReached"
import { ControlPanel } from "./components/ControlPanel"
import { ParticleBackground } from "./components/ParticleBackground"
import { ProcessingIndicator } from "./components/ProcessingIndicator"
import { Button } from "./components/ui/button"
import { Card } from "./components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Github } from "lucide-react"
import { useLanguage, LanguageToggle } from "./lib/i18n.jsx"

function App() {
  const [file, setFile] = useState(null)
  const [imageDims, setImageDims] = useState(null)
  const [scale, setScale] = useState(4)
  const [enhancedImage, setEnhancedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const { t } = useLanguage()

  const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:8000/api"

  const handleImageSelected = async (selectedFile, dims) => {
    if (!selectedFile) {
      setFile(null)
      setEnhancedImage(null)
      setImageDims(null)
      return
    }

    setFile(selectedFile)
    setImageDims(dims)
    setEnhancedImage(null)
    // processImage is now triggered manually
  }

  const processImage = async () => {
    if (!file) return
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("scale", scale)

      const response = await axios.post(`${API_URL}/enhance`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0 // No client timeout, let Nginx handle it
      })

      const imageUrl = URL.createObjectURL(response.data)
      setEnhancedImage(imageUrl)

    } catch (error) {
      console.error("Error enhancing:", error)
      if (error.response?.status === 429) {
        setLimitReached(true)
      } else {
        alert("Error processing image")
      }
      setFile(null)
      setImageDims(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!enhancedImage) return
    const link = document.createElement("a")
    link.href = enhancedImage
    link.download = `enhanced-${file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Language toggle button */}
      <LanguageToggle />

      {/* Animated particle background */}
      <ParticleBackground />

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 md:py-6 lg:py-8 relative z-10 transition-all">
        <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl transition-all duration-300">
          {/* Header */}
          <header className="text-center mb-4 md:mb-6 lg:mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight mb-2 lg:mb-4"
            >
              IAimageBetter
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-sm md:text-base lg:text-lg xl:text-xl mb-3 lg:mb-6"
            >
              {t('subtitle')}
            </motion.p>
            {/* Inline status badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DemoCounter onLimitReached={setLimitReached} />
            </motion.div>
          </header>

          {/* Content area */}
          <AnimatePresence mode="wait">
            {limitReached ? (
              <LimitReached key="limit" />
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {!file && !enhancedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-md mx-auto w-full"
                  >
                    <ImageUploader
                      onImageSelected={handleImageSelected}
                      disabled={isProcessing}
                    />
                  </motion.div>
                )}

                {file && !enhancedImage && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg mx-auto"
                  >
                    <Card className="p-5 lg:p-8 bg-card/50 backdrop-blur border-border/50">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-medium">{t('resolutionTitle')}</h3>
                        <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground text-xl transition-colors">
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-background/50 border border-border">
                          <p className="text-xs text-muted-foreground uppercase mb-1">{t('originalSize')}</p>
                          <p className="text-lg font-mono">{imageDims?.width || '?'} x {imageDims?.height || '?'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-background/50 border border-border relative overflow-hidden">
                          <div className="absolute inset-0 bg-primary/5" />
                          <p className="text-xs text-muted-foreground uppercase mb-1">{t('outputSize')}</p>
                          <p className="text-lg font-mono text-primary font-bold">
                            {imageDims ? Math.round(imageDims.width * scale) : 0} x {imageDims ? Math.round(imageDims.height * scale) : 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 mb-6">
                        <button
                          onClick={() => setScale(2)}
                          className={`flex-1 p-3 rounded-xl border transition-all relative overflow-hidden group ${scale === 2
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-card/80'
                            }`}
                        >
                          <div className="text-2xl font-bold mb-1">2x</div>
                          <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('resolution2x')}</div>
                        </button>

                        <button
                          onClick={() => setScale(4)}
                          className={`flex-1 p-3 rounded-xl border transition-all relative overflow-hidden group ${scale === 4
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-card/80'
                            }`}
                        >
                          <div className="text-2xl font-bold mb-1">4x</div>
                          <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('resolution4x')}</div>
                        </button>
                      </div>

                      <Button
                        size="lg"
                        className="w-full text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold"
                        onClick={processImage}
                      >
                        {t('uploadImage')}
                      </Button>
                    </Card>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ProcessingIndicator
                      isActive={true}
                      fileSize={file?.size || 0}
                      imageDims={imageDims}
                      scale={scale}
                    />
                  </motion.div>
                )}

                {enhancedImage && file && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageComparison
                      before={URL.createObjectURL(file)}
                      after={enhancedImage}
                    />
                    <ControlPanel
                      onDownload={handleDownload}
                      isProcessing={isProcessing}
                    />

                    <div className="mt-6 text-center">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setFile(null)
                          setEnhancedImage(null)
                        }}
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        {t('enhanceAnother')}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="py-8 text-center relative z-10 flex flex-col items-center gap-4">
        <a
          href="https://github.com/ForcexDev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 border border-primary/20 hover:border-primary/50 text-foreground/80 hover:text-primary transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] group backdrop-blur-sm"
        >
          <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">ForcexDev</span>
        </a>
        <p className="text-xs text-muted-foreground/50">
          {t('poweredBy')}
        </p>
      </footer>
    </div>
  )
}

export default App
