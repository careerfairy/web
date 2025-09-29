import { Group } from "@careerfairy/shared-lib/groups"
import { ImpressionLocation, LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Chip, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   heroSection: {
      borderRadius: "20px",
      padding: { xs: 2, md: 4 },
      gap: 5,
      position: "relative",
      height: { xs: "812px", md: "431px" },
      background:
         "linear-gradient(0deg, #F0F4FF 0%, #F0F4FF 100%), linear-gradient(104deg, #F5F7FF 0%, #F5F7FF 100%), linear-gradient(169deg, rgba(98, 117, 255, 0.13) 1.77%, rgba(70, 90, 230, 0.00) 98.23%), linear-gradient(25deg, rgba(70, 90, 230, 0.00) -0.66%, rgba(98, 117, 255, 0.48) 141.07%), #4A5BAD",
   },
   headerContainer: {
      gap: { xs: 1.5, md: 4 },
      alignItems: { xs: "center", md: "flex-start" },
      zIndex: 1,
      maxWidth: "100%",
      alignSelf: "center",
      flexDirection: { xs: "column", md: "row" },
   },
   leftColumn: {
      flex: { md: "1 1 50%" },
      alignItems: { xs: "center", md: "flex-start" },
      textAlign: { xs: "center", md: "left" },
   },
   rightColumn: {
      flex: { md: "1 1 50%" },
      gap: 1.5,
      alignItems: { xs: "center", md: "flex-start" },
      textAlign: { xs: "center", md: "left" },
   },
   sectionTitle: {
      color: "#4A72C8",
      fontWeight: 700,
      lineHeight: 1.2,
   },
   brandTagline: {
      color: "neutral.700",
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
      gap: 1,
      flexDirection: "row",
      alignItems: { xs: "center", md: "flex-start" },
      justifyContent: { xs: "center", md: "flex-start" },
      zIndex: 1,
      flexWrap: "wrap",
   },
   livestreamsGrid: {
      gap: 2,
      alignItems: "stretch",
      zIndex: 1,
      // Position to overlap/overflow the hero section
      position: "relative",
      width: "100%",
   },
   gridItem: {
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
   },
})

interface HeroSectionConsultingProps {
   panelEvents: LivestreamEvent[] // These are now consulting livestreams, not panels
   companies: Group[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function HeroSectionConsulting({
   panelEvents,
   companies,
   handleOpenLivestreamDialog,
}: HeroSectionConsultingProps) {
   const theme = useTheme()
   const isMobile = useIsMobile()
   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"))
   // Refs used to measure the hero container and the overlapping livestreams area
   const heroRef = useRef<HTMLDivElement | null>(null)
   const livestreamsRef = useRef<HTMLDivElement | null>(null)
   // Dynamic bottom spacing equals livestreams' overflow below hero + a base 32px gap
   const [dynamicBottomSpacing, setDynamicBottomSpacing] = useState<number>(32)
   const BASE_GAP_PX = 32

   // Determine grid layout based on number of events
   const shouldUse1x3Layout = panelEvents.length === 4
   const displayedEvents = shouldUse1x3Layout 
      ? panelEvents.slice(0, 3) 
      : isMobile 
         ? panelEvents.slice(0, 3) // Always max 3 cards on mobile
         : panelEvents

   // Compute how much the livestreams extend below the hero and update spacing
   const computeOverlap = useMemo(
      () => () => {
         if (!heroRef.current || !livestreamsRef.current) return
         const heroRect = heroRef.current.getBoundingClientRect()
         const livestreamsRect = livestreamsRef.current.getBoundingClientRect()
         const extensionBelowHero = Math.max(
            0,
            livestreamsRect.bottom - heroRect.bottom
         )
         setDynamicBottomSpacing(extensionBelowHero + BASE_GAP_PX)
      },
      []
   )

   // Keep spacing accurate across resizes between hero and next section
   useEffect(() => {
      const heroEl = heroRef.current
      const livestreamsEl = livestreamsRef.current
      if (!heroEl || !livestreamsEl) return

      // Initial measurement
      computeOverlap()

      // Observe size changes of hero and livestreams
      let heroObserver: ResizeObserver | null = null
      let livestreamsObserver: ResizeObserver | null = null
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
         heroObserver = new ResizeObserver(() => computeOverlap())
         livestreamsObserver = new ResizeObserver(() => computeOverlap())
         heroObserver.observe(heroEl)
         livestreamsObserver.observe(livestreamsEl)
      }

      // Recompute on window resize and orientation changes
      const handleResize = () => computeOverlap()
      window.addEventListener("resize", handleResize)
      window.addEventListener("orientationchange", handleResize)

      return () => {
         window.removeEventListener("resize", handleResize)
         window.removeEventListener("orientationchange", handleResize)
         if (heroObserver) heroObserver.disconnect()
         if (livestreamsObserver) livestreamsObserver.disconnect()
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
                  src="/panels/header-left-visual-support.svg"
                  alt=""
                  width={300}
                  height={300}
                  priority
               />
            </Box>
            {Boolean(isLargeScreen) && (
               <Box aria-hidden sx={styles.visualSupportRight}>
                  <Image
                     src="/panels/header-right-visual-support.svg"
                     alt=""
                     width={300}
                     height={300}
                     priority
                  />
               </Box>
            )}
         </Box>
         <Stack sx={styles.headerContainer}>
            {/* Left column - Title */}
            <Stack sx={styles.leftColumn}>
               <Typography variant="brandedH1" sx={styles.sectionTitle}>
                  Consulting{isMobile ? " " : <br />}collection
               </Typography>
            </Stack>

            {/* Right column - Subtitle and Tags */}
            <Stack sx={styles.rightColumn}>
               <Typography variant="medium" sx={styles.brandTagline}>
                  Join live sessions with Europe's top consulting firms packed with career tips and real stories from young consultants.
               </Typography>
               
               <Stack sx={styles.tagChips}>
                  <Chip
                     label="Talk to real consultants"
                     size="small"
                     sx={{
                        backgroundColor: "rgba(136, 136, 136, 0.22)",
                        color: "neutral.700",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "20px",
                        px: "16px",
                        py: "4px",
                        height: "auto",
                        "& .MuiChip-label": {
                           px: 0,
                           py: 0,
                        },
                     }}
                  />
                  <Chip
                     label="Cases, tips & more"
                     size="small"
                     sx={{
                        backgroundColor: "rgba(136, 136, 136, 0.22)",
                        color: "neutral.700",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "20px",
                        px: "16px",
                        py: "4px",
                        height: "auto",
                        "& .MuiChip-label": {
                           px: 0,
                           py: 0,
                        },
                     }}
                  />
                  <Chip
                     label="Live interaction"
                     size="small"
                     sx={{
                        backgroundColor: "rgba(136, 136, 136, 0.22)",
                        color: "neutral.700",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "20px",
                        px: "16px",
                        py: "4px",
                        height: "auto",
                        "& .MuiChip-label": {
                           px: 0,
                           py: 0,
                        },
                     }}
                  />
               </Stack>
            </Stack>
         </Stack>

         <Box ref={livestreamsRef} sx={styles.livestreamsGrid}>
            <Grid 
               container 
               spacing={2}
               sx={{ justifyContent: "center" }}
            >
               {displayedEvents.map((livestream: LivestreamEvent, index: number) => {
                  // For 1x3 layout (when we have exactly 4 events), use 12/3 = 4 columns each
                  // For 2x3 layout (all other cases), use 12/3 = 4 columns each on medium screens, 12 on mobile
                  const gridSize = shouldUse1x3Layout 
                     ? { xs: 12, sm: 6, md: 4 } 
                     : { xs: 12, sm: 6, md: 4 }
                  
                  return (
                     <Grid
                        key={livestream.id}
                        item
                        {...gridSize}
                        sx={styles.gridItem}
                     >
                        <EventPreviewCard
                           event={livestream}
                           location={ImpressionLocation.panelsOverviewPage}
                           onCardClick={() => handleOpenLivestreamDialog(livestream.id)}
                           index={index}
                           totalElements={displayedEvents.length}
                        />
                     </Grid>
                  )
               })}
            </Grid>
         </Box>
      </Stack>
   )
}