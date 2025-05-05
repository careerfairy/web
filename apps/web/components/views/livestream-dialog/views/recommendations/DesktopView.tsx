import { Box, Stack, styled } from "@mui/material"
import { motion } from "framer-motion"
import { useState } from "react"
import { useLiveStreamDialog } from "../.."
import { GetNotifiedCard } from "./GetNotifiedCard"
import { LoadingIndicator } from "./LoadingIndicator"

const Layout = styled(Box)({
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   height: "100%",
   border: "1px solid red",
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
   const { livestream } = useLiveStreamDialog()
   const [showRecommendations, setShowRecommendations] = useState(false)

   return (
      <Layout
         sx={{
            flexDirection: showRecommendations ? "row" : "column",
         }}
      >
         <Stack justifyContent="center" alignItems="center" spacing={4.75}>
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
      <motion.div
         key="recommendations-list"
         layout
         initial="initial"
         animate="animate"
         exit="exit"
         variants={slideUpAnimation}
      >
         <Box width={800} height={1020} border="1px solid blue">
            Recommendations
         </Box>
      </motion.div>
   )
}
