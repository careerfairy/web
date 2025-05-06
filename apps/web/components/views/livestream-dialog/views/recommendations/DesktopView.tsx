import { Box, styled, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useLiveStreamDialog } from "../.."
import { GetNotifiedCard } from "./GetNotifiedCard"
import { LoadingIndicator } from "./LoadingIndicator"

const Layout = styled(Box)({
   display: "flex",
   minHeight: "100%",
   maxHeight: "100vh",
   overflow: "auto", // Enable scrolling within the layout
   paddingTop: 60,
   paddingLeft: 60,
   paddingRight: 60,
})

// Slide up animation for card list
const slideUpAnimation = {
   initial: { opacity: 0, y: 50 },
   animate: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
         staggerChildren: 0.1,
         when: "beforeChildren",
      },
   },
   exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
}

export const DesktopView = () => {
   const { livestream, setShowRecommendations, showRecommendations } =
      useLiveStreamDialog()

   useEffect(() => {
      return () => {
         setShowRecommendations(false)
      }
   }, [setShowRecommendations])

   return (
      <Layout
         sx={{
            flexDirection: showRecommendations ? "row" : "column",
            justifyContent: showRecommendations ? "flex-start" : "center",
            alignItems: showRecommendations ? "flex-start" : "center",
            paddingTop: showRecommendations ? undefined : "40px",
         }}
         paddingBottom={showRecommendations ? 0 : "60px"}
      >
         <Box
            position="sticky"
            height="fit-content"
            display="flex"
            justifyContent="center"
            top={0}
            sx={{
               width: showRecommendations ? "auto" : "100%",
            }}
         >
            <GetNotifiedCard
               isExpanded={!showRecommendations}
               livestream={livestream}
            />
         </Box>
         {Boolean(showRecommendations) && <Recommendations />}
         <Box
            position="absolute"
            bottom={0}
            left="50%"
            sx={{
               transform: "translateX(-50%)",
            }}
         >
            <LoadingIndicator
               onProgressComplete={() => setShowRecommendations(true)}
            />
         </Box>
      </Layout>
   )
}

const Recommendations = () => {
   return (
      <Box
         component={motion.div}
         key="recommendations-list"
         layout
         initial="initial"
         animate="animate"
         exit="exit"
         variants={slideUpAnimation}
         width={800}
         height={2020}
         sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pl: 4,
         }}
      >
         <Typography fontWeight={700} variant="desktopBrandedH3">
            Keep your pace going! 🔥
         </Typography>
         <Typography variant="medium">
            Here are more interesting live streams
         </Typography>
         Recommendations
      </Box>
   )
}
