import { Group } from "@careerfairy/shared-lib/groups"
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Grid,
   Stack,
   Typography,
   useMediaQuery,
   useTheme,
} from "@mui/material"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { ReasonsToJoinPanelCard } from "../cards/ReasonsToJoinPanelCard"

const styles = sxStyles({
   heroSection: {
      borderRadius: "20px",
      padding: { xs: 2, md: 4 },
      gap: 5,
      position: "relative",
      height: { xs: "812px", md: "431px" },
      background:
         "linear-gradient(0deg, #EDFAF8 0%, #EDFAF8 100%), linear-gradient(104deg, #F5FFF9 0%, #F5FFF9 100%), linear-gradient(169deg, rgba(31, 219, 192, 0.13) 1.77%, rgba(42, 186, 165, 0.00) 98.23%), linear-gradient(25deg, rgba(42, 186, 165, 0.00) -0.66%, rgba(31, 219, 192, 0.48) 141.07%), #376B65",
   },
   logoContainer: {
      gap: 0.5,
      alignItems: "center",
      zIndex: 1,
      maxWidth: { xs: "100%", sm: "534px" },
      alignSelf: "center",
   },
   brandTagline: {
      color: "neutral.700",
      textAlign: "center",
   },
   // Container to clip visual support elements
   visualSupportContainer: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      borderRadius: "20px",
   },
   visualSupportLeft: {
      position: "absolute",
      left: { xs: -78, md: -78 },
      top: -95,
      width: { xs: 174, md: 240 },
      height: { xs: 346, md: "auto" },
      pointerEvents: "none",
   },
   visualSupportRight: {
      position: "absolute",
      right: { xs: -38, md: -30, lg: -24 },
      bottom: 0,
      width: { xs: 273, md: 220 },
      height: { xs: 346, md: "auto" },
      pointerEvents: "none",
   },
   tagChips: {
      gap: { xs: 2, md: 2 },
      flexDirection: { xs: "column", md: "row" },
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
   },
   tagChip: {
      backgroundColor: "#D7DCE1",
      color: "neutral.700",
      px: 4,
      py: 1,
      borderRadius: "42px",
   },
   panelsGrid: {
      gap: 1.5,
      alignItems: "stretch",
      zIndex: 1,
      // Position to overlap/overflow the hero section
      position: "relative",
   },
})

interface HeroSectionProps {
   panelEvents?: LivestreamEvent[]
   consultingLivestreams?: LivestreamEvent[]
   companies: Group[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function HeroSection({
   panelEvents,
   consultingLivestreams,
   companies,
   handleOpenLivestreamDialog,
}: HeroSectionProps) {
   const theme = useTheme()
   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"))
   // Refs used to measure the hero container and the overlapping panels area
   const heroRef = useRef<HTMLDivElement | null>(null)
   const panelsRef = useRef<HTMLDivElement | null>(null)
   // Dynamic bottom spacing equals panels' overflow below hero + a base 32px gap
   const [dynamicBottomSpacing, setDynamicBottomSpacing] = useState<number>(32)
   const BASE_GAP_PX = 32

   // Compute how much the panels extend below the hero and update spacing
   const computeOverlap = useMemo(
      () => () => {
         if (!heroRef.current || !panelsRef.current) return
         const heroRect = heroRef.current.getBoundingClientRect()
         const panelsRect = panelsRef.current.getBoundingClientRect()
         const extensionBelowHero = Math.max(
            0,
            panelsRect.bottom - heroRect.bottom
         )
         setDynamicBottomSpacing(extensionBelowHero + BASE_GAP_PX)
      },
      []
   )

   // Keep spacing accurate across resizes between hero and next section
   useEffect(() => {
      const heroEl = heroRef.current
      const panelsEl = panelsRef.current
      if (!heroEl || !panelsEl) return

      // Initial measurement
      computeOverlap()

      // Observe size changes of hero and panels
      let heroObserver: ResizeObserver | null = null
      let panelsObserver: ResizeObserver | null = null
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
         heroObserver = new ResizeObserver(() => computeOverlap())
         panelsObserver = new ResizeObserver(() => computeOverlap())
         heroObserver.observe(heroEl)
         panelsObserver.observe(panelsEl)
      }

      // Recompute on window resize and orientation changes
      const handleResize = () => computeOverlap()
      window.addEventListener("resize", handleResize)
      window.addEventListener("orientationchange", handleResize)

      return () => {
         window.removeEventListener("resize", handleResize)
         window.removeEventListener("orientationchange", handleResize)
         if (heroObserver) heroObserver.disconnect()
         if (panelsObserver) panelsObserver.disconnect()
      }
   }, [computeOverlap])

   return (
      <Stack
         ref={heroRef}
         sx={[styles.heroSection, { mb: `${dynamicBottomSpacing}px` }]}
      >
         {/* Decorative header visuals */}
         <Box aria-hidden sx={styles.visualSupportContainer}>
            <Box aria-hidden sx={styles.visualSupportLeft}>
               <Image
                  src="/panels/header-left-visual-support-consulting.svg"
                  alt=""
                  width={300}
                  height={300}
                  priority
               />
            </Box>
            {Boolean(isLargeScreen) && (
               <Box aria-hidden sx={styles.visualSupportRight}>
                  <Image
                     src="/panels/header-right-visual-support-consulting.svg"
                     alt=""
                     width={300}
                     height={300}
                     priority
                  />
               </Box>
            )}
         </Box>
         <Stack spacing={1.5}>
            <Stack sx={styles.logoContainer}>
               <Typography
                  variant="h2"
                  sx={{
                     fontWeight: 600,
                     color: "#4A72C8",
                     textAlign: "center",
                  }}
               >
                  Consulting collection
               </Typography>
               <Typography variant="medium" sx={{ ...styles.brandTagline, color: "neutral.800" }}>
                  Join live sessions with Europe's top consulting firms packed with career tips and real stories from young consultants
               </Typography>
            </Stack>

            <Stack sx={styles.tagChips}>
               <Box sx={styles.tagChip}>
                  <Typography variant="medium">Talk to real consultants</Typography>
               </Box>
               <Box sx={styles.tagChip}>
                  <Typography variant="medium">Cases, tips & more</Typography>
               </Box>
               <Box sx={styles.tagChip}>
                  <Typography variant="medium">Live Interaction</Typography>
               </Box>
            </Stack>
         </Stack>

         <Stack
            ref={panelsRef}
            direction={{ xs: "column", md: "row" }}
            sx={styles.panelsGrid}
         >
            {consultingLivestreams ? (
               // Display consulting livestreams in a 2x3 grid
               <Grid container spacing={2} sx={{ width: "100%" }}>
                  {consultingLivestreams.map(
                     (livestream: LivestreamEvent, index: number) => (
                        <Grid key={livestream.id} item xs={12} sm={6} md={4}>
                           <EventPreviewCard
                              event={{ ...livestream, triGrams: {} }}
                              index={index}
                              totalElements={consultingLivestreams.length}
                              location={ImpressionLocation.nextLivestreams}
                              onCardClick={(e) => {
                                 e.preventDefault()
                                 handleOpenLivestreamDialog(livestream.id)
                              }}
                           />
                        </Grid>
                     )
                  )}
               </Grid>
            ) : (
               // Display panels (original behavior)
               panelEvents?.map((panel: LivestreamEvent) => {
                  return (
                     <ReasonsToJoinPanelCard
                        key={panel.id}
                        panel={panel}
                        companies={companies}
                        handleOpenLivestreamDialog={handleOpenLivestreamDialog}
                     />
                  )
               })
            )}
         </Stack>
      </Stack>
   )
}
