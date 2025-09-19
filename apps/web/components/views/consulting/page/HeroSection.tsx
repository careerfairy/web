import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { ReasonsToJoinConsultingCard } from "../cards/ReasonsToJoinConsultingCard"

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
      backgroundColor: "rgba(55, 107, 101, 0.22)",
      color: "neutral.700",
      px: 4,
      py: 1,
      borderRadius: "42px",
   },
   consultingGrid: {
      gap: 1.5,
      alignItems: "stretch",
      zIndex: 1,
      // Position to overlap/overflow the hero section
      position: "relative",
   },
})

interface HeroSectionProps {
   consultingEvents: LivestreamEvent[]
   companies: Group[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function HeroSection({
   consultingEvents,
   companies,
   handleOpenLivestreamDialog,
}: HeroSectionProps) {
   const theme = useTheme()
   const isMobile = useIsMobile()
   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"))
   // Refs used to measure the hero container and the overlapping consulting area
   const heroRef = useRef<HTMLDivElement | null>(null)
   const consultingRef = useRef<HTMLDivElement | null>(null)
   // Dynamic bottom spacing equals consulting' overflow below hero + a base 32px gap
   const [dynamicBottomSpacing, setDynamicBottomSpacing] = useState<number>(32)
   const BASE_GAP_PX = 32

   // Compute how much the consulting extend below the hero and update spacing
   const computeOverlap = useMemo(
      () => () => {
         if (!heroRef.current || !consultingRef.current) return
         const heroRect = heroRef.current.getBoundingClientRect()
         const consultingRect = consultingRef.current.getBoundingClientRect()
         const extensionBelowHero = Math.max(
            0,
            consultingRect.bottom - heroRect.bottom
         )
         setDynamicBottomSpacing(extensionBelowHero + BASE_GAP_PX)
      },
      []
   )

   // Keep spacing accurate across resizes between hero and next section
   useEffect(() => {
      const heroEl = heroRef.current
      const consultingEl = consultingRef.current
      if (!heroEl || !consultingEl) return

      // Initial measurement
      computeOverlap()

      // Observe size changes of hero and consulting
      let heroObserver: ResizeObserver | null = null
      let consultingObserver: ResizeObserver | null = null
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
         heroObserver = new ResizeObserver(() => computeOverlap())
         consultingObserver = new ResizeObserver(() => computeOverlap())
         heroObserver.observe(heroEl)
         consultingObserver.observe(consultingEl)
      }

      // Recompute on window resize and orientation changes
      const handleResize = () => computeOverlap()
      window.addEventListener("resize", handleResize)
      window.addEventListener("orientationchange", handleResize)

      return () => {
         window.removeEventListener("resize", handleResize)
         window.removeEventListener("orientationchange", handleResize)
         if (heroObserver) heroObserver.disconnect()
         if (consultingObserver) consultingObserver.disconnect()
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
         <Stack spacing={1.5}>
            <Stack sx={styles.logoContainer}>
               <Box>
                  <Image
                     src="/panels/masterclass-logo.svg"
                     alt="Consulting Masterclass Logo"
                     width={isMobile ? 258 : 425}
                     height={isMobile ? 54 : 88}
                  />
               </Box>
               <Typography variant="medium" sx={styles.brandTagline}>
                  Live sessions with top consulting professionals to accelerate your career in the industry.
               </Typography>
            </Stack>

            <Stack sx={styles.tagChips}>
               <Box sx={styles.tagChip}>
                  <Typography variant="medium">Free online sessions</Typography>
               </Box>
               <Box sx={styles.tagChip}>
                  <Typography variant="medium">Expert insights & networking</Typography>
               </Box>
            </Stack>
         </Stack>

         <Stack
            ref={consultingRef}
            direction={{ xs: "column", md: "row" }}
            sx={styles.consultingGrid}
         >
            {consultingEvents.map((consulting: LivestreamEvent) => {
               return (
                  <ReasonsToJoinConsultingCard
                     key={consulting.id}
                     consulting={consulting}
                     companies={companies}
                     handleOpenLivestreamDialog={handleOpenLivestreamDialog}
                  />
               )
            })}
         </Stack>
      </Stack>
   )
}