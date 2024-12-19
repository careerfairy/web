import { useTheme } from "@mui/material"
import { motion } from "framer-motion"

export const ANIMATION_DURATION = 0.3
export const ANIMATION_HOLD_SECONDS = 1.2

export const Animation = () => <></>

const Growing = ({ children }) => (
   <motion.div
      layout
      style={{
         display: "flex",
         alignItems: "center",
      }}
      transition={{ duration: ANIMATION_DURATION }}
   >
      {children}
   </motion.div>
)

const SlideLeft = ({ children }) => (
   <motion.div
      key="slide-left"
      initial={{ x: 10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -10, opacity: 0 }}
      transition={{ duration: ANIMATION_DURATION }}
      style={{ position: "absolute" }}
   >
      {children}
   </motion.div>
)

const SlideRight = ({ children }) => (
   <motion.div
      key="slide-right"
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 10, opacity: 0 }}
      transition={{ duration: ANIMATION_DURATION }}
      style={{ position: "absolute" }}
   >
      {children}
   </motion.div>
)

const Glowing = ({ children, isActive }) => {
   const theme = useTheme()
   return (
      <motion.div
         animate={{
            border: isActive
               ? `1.5px solid ${theme.brand.success["700"]}`
               : `1.5px solid ${theme.brand.white["500"]}`,
            boxShadow: isActive
               ? "0px 0px 40px 0px rgba(0, 189, 64, 0.10)"
               : "0px 0px 0px 0px rgba(0, 189, 64, 0.25)",
         }}
         transition={{
            border: { duration: ANIMATION_DURATION },
            boxShadow: { duration: ANIMATION_DURATION - 0.2 }, // just looks better this way
         }}
         style={{
            borderRadius: "20px",
            height: "100%",
         }}
      >
         {children}
      </motion.div>
   )
}

Animation.Growing = Growing
Animation.SlideLeft = SlideLeft
Animation.SlideRight = SlideRight
Animation.Glowing = Glowing
