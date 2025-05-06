import { Box, Stack, styled, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useLiveStreamDialog } from "../.."
import { GetNotifiedCard } from "./GetNotifiedCard"
import { LoadingIndicator } from "./LoadingIndicator"

const Layout = styled(Box)({
   display: "flex",
   minHeight: "100%",
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
         }}
      >
         <Stack
            justifyContent="center"
            alignItems="center"
            spacing={4.75}
            position="sticky"
            height="fit-content"
            paddingTop={showRecommendations ? "5%" : 0}
            top={0}
         >
            <GetNotifiedCard
               isExpanded={!showRecommendations}
               livestream={livestream}
            />
            <LoadingIndicator
               onProgressComplete={() => setShowRecommendations(true)}
            />
         </Stack>
         {Boolean(showRecommendations) && <Recommendations />}
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
            padding: 4,
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
