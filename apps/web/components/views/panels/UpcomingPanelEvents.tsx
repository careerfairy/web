import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { useUpcomingPanelEventsSWR } from "components/custom-hook/panels/useUpcomingPanelEventsSWR"
import useIsMobile from "components/custom-hook/useIsMobile"
import Link from "next/link"
import { Fragment } from "react"
import { ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { DetailedRectanglePanelCard } from "./cards/DetailedRectanglePanelCard"
import { RectanglePanelCard } from "./cards/RectanglePanelCard"
import { SquarePanelCard } from "./cards/SquarePanelCard"
import { VerticalPanelCard } from "./cards/VerticalPanelCard"

const MAX_PANEL_EVENTS = 3

const styles = sxStyles({
   wrapper: {
      pl: {
         xs: 0,
         md: 2,
         ld: 0,
      },
      pr: {
         xs: 0,
         md: 2,
      },
      pb: "28px",
   },
   mainCard: {
      background:
         "linear-gradient(169deg, rgba(31, 219, 192, 0.10) 1.77%, rgba(42, 186, 165, 0.00) 98.23%), linear-gradient(25deg, rgba(42, 186, 165, 0.00) -0.66%, rgba(31, 219, 192, 0.40) 141.07%), #376B65",
      borderRadius: {
         md: "16px",
         xs: 0,
      },
      p: 2,
      gap: { xs: 1.5, md: 4 },
   },
   headerSection: {
      gap: 3,
      maxWidth: { xs: "100%", md: "284px" },
      p: {
         xs: "8px 4px 0px 4px",
         md: 0,
      },
      justifyContent: "center",
   },
   headerTitle: {
      color: (theme) => theme.brand.white[100],
      fontWeight: 700,
   },
   headerDescription: {
      color: (theme) => theme.brand.white[100],
      fontSize: {
         xs: "14px",
         md: "16px",
      },
      lineHeight: "24px",
   },
   ctaButton: {
      minWidth: "260px",
      backgroundColor: (theme) => theme.brand.black[900],
      color: (theme) => theme.brand.white[100],
      borderRadius: "25px",
      px: 3,
      py: 1,
      transition: (theme) => theme.transitions.create(["background-color"]),
      "&:hover": {
         backgroundColor: "#234840",
      },
   },
   panelsSection: {
      gap: 2,
      flexGrow: 1,
      minHeight: 0,
      "& > *": {
         flex: 1,
         minWidth: 0,
      },
   },
   mobileLayout: {
      gap: 2.5,
      alignItems: "stretch",
   },
   mobileRow: {
      gap: 2,
      alignItems: "flex-start",
   },
   mobileDivider: {
      height: 0,
      width: "100%",
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
      mb: "4px",
   },
   mobileCta: {
      color: (theme) => theme.brand.white[100],
      alignItems: "center",
      gap: "4px",
   },
   skeleton: {
      width: "100%",
      height: {
         xs: "440px",
         md: "100%",
      },
      borderRadius: "16px",
   },
})

type UpcomingPanelEventsProps = {
   serverSidePanels?: LivestreamEvent[]
}

export const UpcomingPanelEvents = ({
   serverSidePanels,
}: UpcomingPanelEventsProps) => {
   const { data: upcomingPanelEvents, isLoading } = useUpcomingPanelEventsSWR({
      initialData: serverSidePanels,
      limit: MAX_PANEL_EVENTS,
   })

   if (!upcomingPanelEvents?.length && !isLoading) {
      return null
   }

   return (
      <Box sx={styles.wrapper} id="upcoming-panel-events">
         {isLoading ? (
            <PanelEventsSkeleton />
         ) : (
            <PanelEvents events={upcomingPanelEvents} />
         )}
      </Box>
   )
}

type PanelEventsProps = {
   events: LivestreamEvent[]
}

const PanelEvents = ({ events }: PanelEventsProps) => {
   const isMobile = useIsMobile()

   const renderMobileLayout = () => {
      if (events.length === 1) {
         return <RectanglePanelCard event={events[0]} key={events[0].id} />
      }

      if (events.length === 2) {
         return (
            <Stack direction="row" sx={styles.mobileRow}>
               <VerticalPanelCard event={events[0]} key={events[0].id} />
               <VerticalPanelCard event={events[1]} key={events[1].id} />
            </Stack>
         )
      }

      if (events.length === 3) {
         return (
            <Stack sx={styles.mobileLayout}>
               <RectanglePanelCard event={events[0]} key={events[0].id} />
               <Stack direction="row" sx={styles.mobileRow}>
                  <VerticalPanelCard event={events[1]} key={events[1].id} />
                  <VerticalPanelCard event={events[2]} key={events[2].id} />
               </Stack>
            </Stack>
         )
      }

      return null
   }

   const renderDesktopLayout = () => (
      <Stack direction="row" sx={styles.panelsSection}>
         {events.length > 1 && events.length <= 3
            ? events.map((event) => (
                 <SquarePanelCard
                    event={event}
                    key={event.id}
                    fullRegistrationStatus={events.length === 2}
                 />
              ))
            : null}
         {events.length === 1
            ? events.map((event) => (
                 <DetailedRectanglePanelCard event={event} key={event.id} />
              ))
            : null}
      </Stack>
   )

   if (!events?.length) {
      return null
   }

   return (
      <Stack direction={isMobile ? "column" : "row"} sx={styles.mainCard}>
         <PanelsHeader showCTA={!isMobile} />
         {isMobile ? renderMobileLayout() : renderDesktopLayout()}
         {isMobile ? <PanelsMobileCTA /> : null}
      </Stack>
   )
}

const PanelsHeader = ({ showCTA = false }: { showCTA?: boolean }) => {
   return (
      <Stack sx={styles.headerSection}>
         <Stack spacing={!showCTA ? "4px" : "8px"}>
            <Typography variant="brandedH3" sx={styles.headerTitle}>
               Hear what they wish they knew
            </Typography>
            <Typography variant="small" sx={styles.headerDescription}>
               Live conversations with employees from top companies who&apos;ve
               faced the future you&apos;re worried about.
            </Typography>
         </Stack>

         {showCTA ? <PanelsCTA /> : null}
      </Stack>
   )
}

const PanelsCTA = () => {
   return (
      <Button
         component={Link}
         href="/panels"
         sx={styles.ctaButton}
         endIcon={<ChevronRight size={18} />}
      >
         <Typography variant="medium">Discover all about panels</Typography>
      </Button>
   )
}

const PanelsMobileCTA = () => {
   return (
      <Fragment>
         <Box sx={styles.mobileDivider} />
         <Stack
            component={Link}
            href="/panels"
            sx={styles.mobileCta}
            direction="row"
         >
            <Typography variant="small">Discover all about panels</Typography>
            <ChevronRight size={24} style={{ marginLeft: "0px" }} />
         </Stack>
      </Fragment>
   )
}

const PanelEventsSkeleton = () => {
   const isMobile = useIsMobile()

   return (
      <Stack direction={isMobile ? "column" : "row"} sx={styles.mainCard}>
         <PanelsHeader showCTA={!isMobile} />
         <Box width="100%" minHeight="100%">
            <Skeleton variant="rectangular" sx={styles.skeleton} />
         </Box>
         {isMobile ? <PanelsMobileCTA /> : null}
      </Stack>
   )
}
