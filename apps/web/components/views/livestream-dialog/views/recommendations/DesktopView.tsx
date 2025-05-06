import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Box, Stack, styled, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useLiveStreamDialog } from "../.."
import { EventsGrid } from "./EventsGrid"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { LoadingIndicator } from "./LoadingIndicator"

const Layout = styled(Box)(({ theme }) => ({
   display: "flex",
   paddingTop: 60,
   paddingLeft: 60,
   paddingRight: 60,
   position: "relative",
   [theme.breakpoints.down(990)]: {
      paddingLeft: 40,
      paddingRight: 40,
   },
}))

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

   const { events, loading: loadingEvents } = useRecommendedEvents({
      bypassCache: true,
   })

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
            minHeight: showRecommendations ? "100%" : undefined,
            maxHeight: showRecommendations ? "100vh" : undefined,
            overflow: showRecommendations ? "auto" : undefined,
         }}
         paddingBottom={showRecommendations ? 0 : "90px"}
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
         {Boolean(showRecommendations) && (
            <Recommendations events={events} loading={loadingEvents} />
         )}
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

const Recommendations = ({
   events,
   loading,
}: {
   events: LivestreamEvent[]
   loading: boolean
}) => {
   const singleColumn = useIsMobile(1250)

   return (
      <Box
         component={motion.div}
         key="recommendations-list"
         layout
         initial="initial"
         animate="animate"
         exit="exit"
         variants={slideUpAnimation}
         width="100%"
         height={2020}
         sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pl: 4,
         }}
      >
         <Stack textAlign="center" pb="23px">
            <Typography fontWeight={700} variant="desktopBrandedH3">
               Keep your pace going!&nbsp;🔥
            </Typography>
            <Typography variant="medium">
               Here are more interesting live streams
            </Typography>
         </Stack>
         <EventsGrid
            singleColumn={singleColumn}
            events={events}
            loading={loading}
         />
      </Box>
   )
}
