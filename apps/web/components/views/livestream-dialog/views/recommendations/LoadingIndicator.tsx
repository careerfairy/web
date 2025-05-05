import {
   Box,
   LinearProgress,
   linearProgressClasses,
   styled,
   Typography,
} from "@mui/material"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

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
   width: "100%",
   maxWidth: "340px",
   overflow: "hidden",
})

const TextContainer = styled(Box)({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   paddingBottom: "6px",
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

const variants = {
   visible: { opacity: 1, y: 0 },
   hidden: { opacity: 0, y: 20 },
}

type Props = {
   onProgressComplete?: () => void
}

export const LoadingIndicator = ({ onProgressComplete }: Props) => {
   const [progress, setProgress] = useState(0)
   const onProgressCompleteRef = useRef(onProgressComplete)

   useEffect(() => {
      if (onProgressComplete) {
         onProgressCompleteRef.current = onProgressComplete
      }
   }, [onProgressComplete])

   useEffect(() => {
      const timer = setInterval(() => {
         setProgress((prevProgress) => {
            const newProgress = prevProgress + PROGRESS_STEP
            if (newProgress >= 100) {
               clearInterval(timer)
               if (onProgressCompleteRef.current) {
                  onProgressCompleteRef.current()
               }
               return 100
            }
            return newProgress
         })
      }, UPDATE_INTERVAL_MS)

      return () => {
         clearInterval(timer)
      }
   }, [])

   return (
      <Container
         data-testid="loading-indicator"
         initial="visible"
         animate={progress === 100 ? "hidden" : "visible"}
         variants={variants}
         transition={{ duration: 0.5, ease: "easeOut" }}
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
