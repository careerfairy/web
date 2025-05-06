import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Box, Stack, styled, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import { SlideUpWithStaggeredChildrenAnimation } from "components/util/framer-animations"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useLiveStreamDialog } from "../.."
import { EventsGrid } from "./EventsGrid"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { LoadingIndicator } from "./LoadingIndicator"

const Layout = styled(Box)<{ expanded?: boolean }>(({ theme, expanded }) => ({
   display: "flex",
   position: "relative",
   paddingTop: expanded ? 60 : "40px",
   paddingLeft: 60,
   paddingRight: 60,
   flexDirection: expanded ? "row" : "column",
   justifyContent: expanded ? "flex-start" : "center",
   alignItems: expanded ? "flex-start" : "center",
   minHeight: expanded ? "100%" : undefined,
   maxHeight: expanded ? "100vh" : undefined,
   overflow: expanded ? "auto" : undefined,
   [theme.breakpoints.down(990)]: {
      paddingLeft: 40,
      paddingRight: 40,
   },
}))

const CardContainer = styled(Box)<{ fullWidth: boolean }>(({ fullWidth }) => ({
   position: "sticky",
   height: "fit-content",
   display: "flex",
   justifyContent: "center",
   top: 0,
   width: fullWidth ? "100%" : "auto",
}))

const LoadingContainer = styled(Box)({
   position: "absolute",
   bottom: 0,
   left: "50%",
   transform: "translateX(-50%)",
})

const RecommendationsContainer = styled(motion.div)(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   paddingLeft: theme.spacing(4),
   width: "100%",
}))

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
         expanded={showRecommendations}
         paddingBottom={showRecommendations ? 0 : "90px"}
      >
         <CardContainer fullWidth={!showRecommendations}>
            <GetNotifiedCard
               isExpanded={!showRecommendations}
               livestream={livestream}
            />
         </CardContainer>
         {Boolean(showRecommendations) && (
            <Recommendations events={events} loading={loadingEvents} />
         )}
         <LoadingContainer>
            <LoadingIndicator
               onProgressComplete={() => setShowRecommendations(true)}
            />
         </LoadingContainer>
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
      <RecommendationsContainer
         key="recommendations-list"
         layout
         initial="initial"
         animate="animate"
         exit="exit"
         variants={SlideUpWithStaggeredChildrenAnimation}
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
      </RecommendationsContainer>
   )
}
