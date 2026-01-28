import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card } from "./ui/card"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "../lib/i18n.jsx"

export function ImageUploader({ onImageSelected, disabled }) {
    const [preview, setPreview] = useState(null)
    const { t } = useLanguage()

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]
            setPreview(URL.createObjectURL(file))

            const img = new Image()
            img.onload = () => {
                onImageSelected(file, { width: img.naturalWidth, height: img.naturalHeight })
            }
            img.src = URL.createObjectURL(file)
        }
    }, [onImageSelected])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        maxSize: 50 * 1024 * 1024, // 50MB for local version (no practical limit)
        multiple: false,
        disabled,
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0]?.errors[0]
            if (error?.code === 'file-too-large') {
                alert(t('fileTooLarge'))
            }
        }
    })

    const clearPreview = (e) => {
        e.stopPropagation()
        setPreview(null)
        onImageSelected(null)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Card
                {...getRootProps()}
                className={`
                    relative overflow-hidden cursor-pointer
                    min-h-[200px] md:min-h-[240px] lg:min-h-[320px] xl:min-h-[400px] flex items-center justify-center
                    transition-all duration-200
                    bg-card border border-border
                    ${isDragActive
                        ? 'border-foreground/50 bg-secondary'
                        : 'hover:border-foreground/30 hover:bg-card/80'
                    }
                    ${disabled ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {preview ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-full h-full min-h-[200px] md:min-h-[240px] lg:min-h-[320px] xl:min-h-[400px] p-3 flex items-center justify-center"
                        >
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-contain max-h-[300px] lg:max-h-[500px] rounded"
                            />
                            <button
                                onClick={clearPreview}
                                className="absolute top-5 right-5 p-1.5 lg:p-3 bg-background/80 rounded-full hover:bg-background transition-colors"
                            >
                                <X className="w-4 h-4 lg:w-6 lg:h-6" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dropzone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center p-6 lg:p-12"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 lg:w-24 lg:h-24 bg-secondary rounded-full mb-4 lg:mb-8">
                                {isDragActive ? (
                                    <ImageIcon className="w-5 h-5 lg:w-10 lg:h-10 text-foreground" />
                                ) : (
                                    <Upload className="w-5 h-5 lg:w-10 lg:h-10 text-muted-foreground" />
                                )}
                            </div>
                            <h3 className="text-base lg:text-3xl font-medium mb-1 lg:mb-3">
                                {isDragActive ? t('dropHere') : t('uploadImage')}
                            </h3>
                            <p className="text-muted-foreground text-sm lg:text-xl">
                                {t('dragOrClick')}
                            </p>
                            <p className="text-muted-foreground/60 text-xs lg:text-base mt-2 lg:mt-4">
                                {t('maxSize')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    )
}
