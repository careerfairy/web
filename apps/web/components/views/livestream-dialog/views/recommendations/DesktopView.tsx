import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import {
   Box,
   IconButton,
   IconButtonProps,
   Stack,
   styled,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import { SlideUpWithStaggeredChildrenAnimation } from "components/util/framer-animations"
import { motion } from "framer-motion"
import { Fragment, useState } from "react"
import { X as CloseIcon } from "react-feather"
import { useLiveStreamDialog } from "../.."
import { EventsGrid } from "./EventsGrid"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { LoadingIndicator } from "./LoadingIndicator"

const PADDING = 60

const Layout = styled(Box, {
   shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
   display: "flex",
   position: "relative",
   paddingLeft: expanded ? 60 : 0,
   paddingRight: expanded ? 60 : 0,
   minHeight: "100%",
   flexDirection: expanded ? "row" : "column",
   justifyContent: expanded ? "flex-start" : "center",
   alignItems: expanded ? "flex-start" : "center",
   maxHeight: expanded ? "100vh" : undefined,
   overflow: expanded ? "auto" : undefined,
   [theme.breakpoints.down(990)]: {
      paddingLeft: expanded ? 40 : 0,
      paddingRight: expanded ? 40 : 0,
   },
}))

const CardContainer = styled(Box, {
   shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded: boolean }>(({ expanded, theme }) => ({
   position: "sticky",
   display: "flex",
   flexDirection: "column",
   justifyContent: "center",
   alignItems: "center",
   top: 0,
   height: "100%",
   overflowY: "auto",
   overflowX: "hidden",
   width: expanded ? "auto" : "100%",
   flexShrink: expanded ? 0 : 1,
   paddingRight: expanded ? theme.spacing(2) : 0,
}))

const CardContainerInner = styled(Box, {
   shouldForwardProp: (prop) => prop !== "isRecommendationsListVisible",
})<{ isRecommendationsListVisible: boolean }>(
   ({ isRecommendationsListVisible }) => ({
      paddingBottom: isRecommendationsListVisible ? PADDING : 0,
      paddingTop: isRecommendationsListVisible ? PADDING : 50,
      height: "100%",
   })
)

const LoadingContainer = styled(Box)({
   position: "absolute",
   bottom: 20,
   left: "50%",
   transform: "translateX(-50%)",
})

const RecommendationsContainer = styled(motion.div)(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   width: "100%",
   paddingTop: PADDING,
   paddingLeft: theme.spacing(2),
}))

const CloseButton = styled((props: IconButtonProps) => (
   <IconButton {...props}>
      <CloseIcon />
   </IconButton>
))({
   position: "absolute",
   top: 24,
   right: 24,
   padding: 4,
})

export const DesktopView = () => {
   const {
      livestream,
      setIsRecommendationsListVisible,
      isRecommendationsListVisible,
      closeDialog,
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
      <Fragment>
         <CloseButton onClick={closeDialog} />
         <Layout
            expanded={isRecommendationsListVisible}
            paddingBottom={isRecommendationsListVisible ? 0 : 0}
         >
            <CardContainer
               data-testid="get-notified-card-container"
               expanded={isRecommendationsListVisible}
            >
               <CardContainerInner
                  isRecommendationsListVisible={isRecommendationsListVisible}
               >
                  <GetNotifiedCard
                     isExpanded={!isRecommendationsListVisible}
                     livestream={livestream}
                     animateLayout
                  />
                  {isRecommendationsListVisible ? null : (
                     <Box data-testid="loading-indicator-offset" height={85} />
                  )}
               </CardContainerInner>
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
      </Fragment>
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
