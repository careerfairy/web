import {
   Box,
   LinearProgress,
   linearProgressClasses,
   styled,
   Typography,
} from "@mui/material"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { ANIMATION_CONFIG } from "../../animations/register-success/animationConfig"

const Container = styled(motion.div)({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   justifyContent: "center",
   padding: "6px 0 0",
   borderRadius: "200px",
   background: "rgba(255, 255, 255, 0.82)",
   backdropFilter: "blur(15px)",
   boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
   border: "1px solid #FFFFFF",
   width: 264,
   overflow: "hidden",
})

const TextContainer = styled(Box)({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   paddingBottom: "6px",
   textAlign: "center",
})

const ProgressContainer = styled(Box)({
   width: "100%",
   height: "4px",
})

const StyledLinearProgress = styled(LinearProgress)({
   height: 4,
   borderRadius: 0,
   [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "#EBEBEF",
   },
   [`& .${linearProgressClasses.bar}`]: {
      backgroundColor: "#2ABAA5",
   },
})

const LOADING_DURATION_MS = 6000 // 6 seconds in milliseconds
const UPDATE_INTERVAL_MS = 60 // Update every 60ms for smooth animation
const PROGRESS_STEP = (UPDATE_INTERVAL_MS / LOADING_DURATION_MS) * 100
const DELAY_START_MS = ANIMATION_CONFIG.container.delayBeforeExit

const variants = {
   visible: { opacity: 1, y: 0 },
   hidden: { opacity: 0, y: 20 },
}

type Props = {
   onProgressComplete?: () => void
}

export const LoadingIndicator = ({ onProgressComplete }: Props) => {
   const { progress, isComplete, handleAnimationComplete } =
      useProgressIndicator(onProgressComplete)

   if (isComplete) {
      return null
   }

   return (
      <Container
         data-testid="loading-indicator"
         initial="visible"
         animate={progress === 100 ? "hidden" : "visible"}
         variants={variants}
         transition={{ duration: 0.5, ease: "easeOut" }}
         onAnimationComplete={handleAnimationComplete}
      >
         <TextContainer>
            <Typography color="neutral.500" variant="xsmall">
               Hold on
            </Typography>
            <Typography color="neutral.800" variant="small">
               Finding your next favorite streams
            </Typography>
         </TextContainer>
         <ProgressContainer>
            <StyledLinearProgress variant="determinate" value={progress} />
         </ProgressContainer>
      </Container>
   )
}

/**
 * Custom hook to manage progress indicator lifecycle
 */
const useProgressIndicator = (onProgressComplete?: () => void) => {
   const [progress, setProgress] = useState(0)
   const [isComplete, setIsComplete] = useState(false)
   const [isStarted, setIsStarted] = useState(false)
   const onProgressCompleteRef = useRef(onProgressComplete)

   useEffect(() => {
      if (onProgressComplete) {
         onProgressCompleteRef.current = onProgressComplete
      }
   }, [onProgressComplete])

   // Effect to handle progress completion and callback
   useEffect(() => {
      if (progress === 100 && onProgressCompleteRef.current) {
         onProgressCompleteRef.current()
      }
   }, [progress])

   useEffect(() => {
      // Add a timeout to delay the start of the progress
      const startDelay = setTimeout(() => {
         setIsStarted(true)
      }, DELAY_START_MS)

      let progressTimer: NodeJS.Timeout | null = null

      if (isStarted) {
         progressTimer = setInterval(() => {
            setProgress((prevProgress) => {
               const newProgress = prevProgress + PROGRESS_STEP
               if (newProgress >= 100) {
                  if (progressTimer) clearInterval(progressTimer)
                  return 100
               }
               return newProgress
            })
         }, UPDATE_INTERVAL_MS)
      }

      return () => {
         clearTimeout(startDelay)
         if (progressTimer) clearInterval(progressTimer)
      }
   }, [isStarted])

   const handleAnimationComplete = () => {
      if (progress === 100) {
         setIsComplete(true)
      }
   }

   return {
      progress,
      isComplete,
      handleAnimationComplete,
   }
}
