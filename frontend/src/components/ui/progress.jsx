import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export const Progress = ({ value = 0, className, ...props }) => {
    return (
        <div
            className={cn(
                "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
                className
            )}
            {...props}
        >
            <motion.div
                className="h-full w-full flex-1 bg-primary transition-all"
                initial={{ x: "-100%" }}
                animate={{ x: `${value - 100}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
        </div>
    )
}
