import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Box, Stack, styled, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import { SlideUpWithStaggeredChildrenAnimation } from "components/util/framer-animations"
import { motion } from "framer-motion"
import { useState } from "react"
import { useLiveStreamDialog } from "../.."
import { EventsGrid } from "./EventsGrid"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { LoadingIndicator } from "./LoadingIndicator"

const PADDING = 76

const Layout = styled(Box, {
   shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
   display: "flex",
   position: "relative",
   paddingLeft: 60,
   paddingRight: 60,
   minHeight: "100%",
   flexDirection: expanded ? "row" : "column",
   justifyContent: expanded ? "flex-start" : "center",
   alignItems: expanded ? "flex-start" : "center",
   maxHeight: expanded ? "100vh" : undefined,
   overflow: expanded ? "auto" : undefined,
   [theme.breakpoints.down(990)]: {
      paddingLeft: 40,
      paddingRight: 40,
   },
}))

const CardContainer = styled(Box, {
   shouldForwardProp: (prop) => prop !== "fullWidth" && prop !== "expanded",
})<{ fullWidth: boolean; expanded: boolean }>(({ fullWidth, expanded }) => ({
   position: "sticky",
   display: "flex",
   justifyContent: "center",
   alignItems: "center",
   top: 0,
   width: fullWidth ? "100%" : "auto",
   height: "100%",
   paddingBottom: expanded ? PADDING : 20,
   paddingTop: expanded ? PADDING : 20,
}))

const LoadingContainer = styled(Box)({
   position: "absolute",
   bottom: 30,
   left: "50%",
   transform: "translateX(-50%)",
})

const RecommendationsContainer = styled(motion.div)(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   paddingLeft: theme.spacing(4),
   width: "100%",
   paddingTop: PADDING,
}))

export const DesktopView = () => {
   const {
      livestream,
      setIsRecommendationsListVisible,
      isRecommendationsListVisible,
   } = useLiveStreamDialog()

   const { events, loading: loadingEvents } = useRecommendedEvents({
      bypassCache: true,
   })

   // Skip 6 seconds loader animation when returning to this view (when hitting back button or going back in browser history)
   // eslint-disable-next-line react/hook-use-state
   const [shouldHideLoaderOnInitialMount] = useState(
      isRecommendationsListVisible
   )

   return (
      <Layout
         expanded={isRecommendationsListVisible}
         paddingBottom={isRecommendationsListVisible ? 0 : "90px"}
      >
         <CardContainer
            fullWidth={!isRecommendationsListVisible}
            expanded={isRecommendationsListVisible}
         >
            <GetNotifiedCard
               isExpanded={!isRecommendationsListVisible}
               livestream={livestream}
               animateLayout
            />
         </CardContainer>
         {Boolean(isRecommendationsListVisible) && (
            <Recommendations events={events} loading={loadingEvents} />
         )}
         {!shouldHideLoaderOnInitialMount && (
            <LoadingContainer>
               <LoadingIndicator
                  onProgressComplete={() =>
                     setIsRecommendationsListVisible(true)
                  }
               />
            </LoadingContainer>
         )}
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
         <Stack component={motion.div} layout textAlign="center" pb="23px">
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
