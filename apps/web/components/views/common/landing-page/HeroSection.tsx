import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Chip,
   Grid,
   Stack,
   SxProps,
   Theme,
   Typography,
   useMediaQuery,
   useTheme,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   heroSection: {
      borderRadius: "20px",
      padding: { xs: 2, md: 4 },
      gap: 5,
      position: "relative",
      height: { xs: "812px", md: "431px" },
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
      fontWeight: 700,
      lineHeight: 1.2,
   },
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
   tagChip: {
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
   },
   livestreamsGrid: {
      gap: 2,
      alignItems: "stretch",
      zIndex: 1,
      position: "relative",
      width: "100%",
   },
   gridItem: {
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
   },
})

export interface HeroSectionConfig {
   title: string
   subtitle: string
   tags: string[]
   backgroundSx: SxProps<Theme>
   titleColorSx: SxProps<Theme>
   subtitleColorSx: SxProps<Theme>
   tagChipSx: SxProps<Theme>
   visualSupport?: {
      left?: string
      right?: string
   }
   impressionLocation: ImpressionLocation
}

interface HeroSectionProps {
   config: HeroSectionConfig
   events: LivestreamEvent[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function HeroSection({
   config,
   events,
   handleOpenLivestreamDialog,
}: HeroSectionProps) {
   const theme = useTheme()
   const isMobile = useIsMobile()
   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"))
   const heroRef = useRef<HTMLDivElement | null>(null)
   const livestreamsRef = useRef<HTMLDivElement | null>(null)
   const [dynamicBottomSpacing, setDynamicBottomSpacing] = useState<number>(32)
   const BASE_GAP_PX = 32

   const shouldUse1x3Layout = events.length === 4
   const displayedEvents = shouldUse1x3Layout
      ? events.slice(0, 3)
      : isMobile
      ? events.slice(0, 3)
      : events

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

   useEffect(() => {
      const heroEl = heroRef.current
      const livestreamsEl = livestreamsRef.current
      if (!heroEl || !livestreamsEl) return

      computeOverlap()

      let heroObserver: ResizeObserver | null = null
      let livestreamsObserver: ResizeObserver | null = null
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
         heroObserver = new ResizeObserver(() => computeOverlap())
         livestreamsObserver = new ResizeObserver(() => computeOverlap())
         heroObserver.observe(heroEl)
         livestreamsObserver.observe(livestreamsEl)
      }

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
         sx={combineStyles(styles.heroSection, config.backgroundSx, {
            mb: `${dynamicBottomSpacing}px`,
         })}
      >
         <Box aria-hidden sx={styles.visualSupportContainer}>
            {Boolean(config.visualSupport?.left) && (
               <Box aria-hidden sx={styles.visualSupportLeft}>
                  <Image
                     src={config.visualSupport.left}
                     alt=""
                     width={300}
                     height={300}
                     priority
                  />
               </Box>
            )}
            {Boolean(isLargeScreen && config.visualSupport?.right) && (
               <Box aria-hidden sx={styles.visualSupportRight}>
                  <Image
                     src={config.visualSupport.right}
                     alt=""
                     width={300}
                     height={300}
                     priority
                  />
               </Box>
            )}
         </Box>
         <Stack sx={styles.headerContainer}>
            <Stack sx={styles.leftColumn}>
               <Typography
                  variant="brandedH1"
                  sx={combineStyles(styles.sectionTitle, config.titleColorSx)}
               >
                  {config.title.split(" ")[0]}
                  {isMobile ? " " : <br />}
                  {config.title.split(" ").slice(1).join(" ")}
               </Typography>
            </Stack>

            <Stack sx={styles.rightColumn}>
               <Typography variant="medium" sx={config.subtitleColorSx}>
                  {config.subtitle}
               </Typography>

               <Stack sx={styles.tagChips}>
                  {config.tags.map((tag, index) => (
                     <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={combineStyles(styles.tagChip, config.tagChipSx)}
                     />
                  ))}
               </Stack>
            </Stack>
         </Stack>

         <Box ref={livestreamsRef} sx={styles.livestreamsGrid}>
            <Grid container spacing={2} sx={{ justifyContent: "center" }}>
               {displayedEvents.map(
                  (livestream: LivestreamEvent, index: number) => (
                     <Grid
                        key={livestream.id}
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={styles.gridItem}
                     >
                        <EventPreviewCard
                           event={livestream}
                           location={config.impressionLocation}
                           onCardClick={() =>
                              handleOpenLivestreamDialog(livestream.id)
                           }
                           index={index}
                           totalElements={displayedEvents.length}
                        />
                     </Grid>
                  )
               )}
            </Grid>
         </Box>
      </Stack>
   )
}
