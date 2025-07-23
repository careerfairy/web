import { Box, Button, Dialog, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useTrackWebviewResumedCount } from "components/custom-hook/utils/useTrackWebviewResumed"
import { MainLogo } from "components/logos"
import FramerBox from "components/views/common/FramerBox"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"

// Slide data constants
const SLIDES = [
   {
      id: 1,
      title: "Money, Flexibility or Purpose?",
      description:
         "Tell us who you are to discover companies that offer what you want",
      imageUrl: "/illustrations/nudge-image-1.jpg",
   },
   {
      title: "Find Your Perfect Match",
      description:
         "Connect with companies that align with your values and career goals",
      imageUrl: "/illustrations/nudge-image-2.jpg",
   },
   {
      title: "Start Your Journey",
      description:
         "Join thousands of professionals discovering their dream careers",
      imageUrl: "/illustrations/nudge-image-3.jpg",
   },
]

const styles = sxStyles({
   overlay: {
      position: "fixed",
      // top: 0,
      // left: 0,
      // right: 0,
      // bottom: 0,
      backgroundColor: (theme) => theme.palette.secondary.main, // Purple background from Figma
      // zIndex: 9999,
      // display: "flex",
      // flexDirection: "column",
      minHeight: "100dvh",
   },
   header: {
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: "24px",
      paddingTop: "56px", // Account for status bar
   },
   logo: {
      width: "124px",
      height: "29px",
      filter: "brightness(0) invert(1)", // Make logo white
   },
   loginButton: {
      backgroundColor: "rgba(252, 252, 254, 0.43)",
      backdropFilter: "blur(200px)",
      borderRadius: "18px",
      padding: "8px 16px",
      color: "white",
      textTransform: "none",
      fontSize: "14px",
      fontWeight: 400,
      "&:hover": {
         backgroundColor: "rgba(252, 252, 254, 0.6)",
      },
   },
   content: {
      gap: "16px",
      padding: "0 24px",
      justifyContent: "flex-start",
   },
   carouselContainer: {
      // width: "327px",
      // height: "100%",
      // display: "flex",
      // flexDirection: "column",
      // justifyContent: "flex-end",
      // alignItems: "center",
      // gap: "12px",
   },
   carouselViewport: {
      // width: "100%",
      borderRadius: "12px",
      // width: "327px",
      // height: "100%",
   },
   slideImageWrapper: {
      // height: "100%",
   },
   slideImage: {
      // width: "400px",
      width: "100dvw",
      // maxWidth: "327px",
      minHeight: "337px",
      display: "flex",
      // height: "100%",
      borderRadius: "12px",
      objectFit: "cover",
      objectPosition: "center",
      alignSelf: "center",
   },
   dotsContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "6px",
   },
   dot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.49)",
      transition: "all 0.3s ease",
      cursor: "pointer",
   },
   dotActive: {
      width: "34px",
      height: "12px",
      borderRadius: "9px",
      backgroundColor: "#FAFAFE",
   },
   slideText: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      width: "100%",
      minHeight: "115px",
   },
   slideTitle: {
      color: "#FCFCFE",
      fontSize: "30px",
      fontWeight: 800,
      lineHeight: "1.133",
      letterSpacing: "-0.9px",
      textTransform: "uppercase",
      textAlign: "left",
   },
   slideDescription: {
      color: "#F3F3F5",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "1.5",
      textAlign: "left",
   },
   ctaSection: {
      height: "100%",
      mt: 2,
      backgroundColor: "rgba(255, 255, 255, 0.93)",
      borderRadius: "16px 16px 0 0",
      padding: "25px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      width: "100%",
   },
   primaryButton: {
      backgroundColor: (theme) => theme.palette.primary[600],
      color: "white",
      borderRadius: "100px",
      padding: "12px 28px",
      fontSize: "16px",
      fontWeight: 400,
      textTransform: "none",
      "&:hover": {
         backgroundColor: "#25A595",
      },
   },
   secondaryButton: {
      color: "#6B6B7F",
      borderRadius: "24px",
      padding: "12px 28px",
      fontSize: "16px",
      fontWeight: 400,
      textTransform: "none",
      "&:hover": {
         backgroundColor: "rgba(107, 107, 127, 0.1)",
      },
   },
})

// Animation variants for text transitions
const textAnimationVariants = {
   initial: {
      opacity: 0,
      // y: 20
   },
   animate: {
      opacity: 1,
      // y: 0,
      transition: {
         duration: 0.4,
         ease: "easeInOut",
      },
   },
   // exit: {
   //    opacity: 0,
   //    // y: -20,
   //    transition: {
   //       duration: 0.2,
   //       ease: "easeOut",
   //    },
   // },
}

export const LoginNudgeOverlay = () => {
   const { shouldShow, handleDismiss } = useLoginNudgeOverlay()
   const router = useRouter()
   const [currentSlide, setCurrentSlide] = useState(0)
   console.log("🚀 ~ LoginNudgeOverlay ~ currentSlide:", currentSlide)

   // Embla carousel options
   const emblaOptions: EmblaOptionsType = {
      loop: true,
      axis: "x",
      duration: 20,
      dragFree: false,
      direction: "ltr",
   }

   const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [
      WheelGesturesPlugin(),
   ])

   // Auto-advance slides every 5 seconds
   useEffect(() => {
      if (!shouldShow || !emblaApi) return

      let interval: NodeJS.Timeout

      const startAutoScroll = () => {
         // interval = setInterval(() => {
         //    emblaApi.scrollNext()
         // }, 5000)
      }

      const stopAutoScroll = () => {
         if (interval) {
            clearInterval(interval)
         }
      }

      const resetAutoScroll = () => {
         stopAutoScroll()
         startAutoScroll()
      }

      // Start auto-scroll
      startAutoScroll()

      // Listen for user interactions to reset timer
      const onSelect = () => {
         // Reset timer when slide changes (manual or automatic)
         resetAutoScroll()
      }

      const onSettle = () => {
         // Reset timer when user finishes scrolling
         resetAutoScroll()
      }

      emblaApi.on("select", onSelect)
      emblaApi.on("settle", onSettle)

      return () => {
         stopAutoScroll()
         emblaApi.off("select", onSelect)
         emblaApi.off("settle", onSettle)
      }
   }, [shouldShow, emblaApi])

   // Update current slide when embla changes
   useEffect(() => {
      if (!emblaApi) return

      const onSelect = () => {
         setCurrentSlide(emblaApi.selectedScrollSnap())
      }

      emblaApi.on("select", onSelect)
      return () => {
         emblaApi.off("select", onSelect)
      }
   }, [emblaApi])

   const handleLogin = useCallback(() => {
      handleDismiss()
      router.push("/login")
   }, [handleDismiss, router])

   const handleGetStarted = useCallback(() => {
      handleDismiss()
      router.push("/signup")
   }, [handleDismiss, router])

   const handleExploreApp = useCallback(() => {
      handleDismiss()
      // Continue as logged out user
   }, [handleDismiss])

   const handleDotClick = useCallback(
      (index: number) => {
         emblaApi?.scrollTo(index)
      },
      [emblaApi]
   )

   if (!shouldShow) return null

   return (
      <Dialog
         open={true}
         fullScreen
         PaperProps={{
            sx: styles.overlay,
         }}
      >
         {/* Header */}
         <Stack sx={styles.header} direction={"row"}>
            <MainLogo white />
            <Button
               onClick={handleLogin}
               sx={styles.loginButton}
               variant="text"
            >
               Login
            </Button>
         </Stack>

         {/* Content */}
         <Stack sx={styles.content} alignItems={"space-between"}>
            <Stack
               sx={styles.carouselContainer}
               justifyContent={"space-between"}
               spacing={"12px"}
            >
               {/* GenericCarousel */}
               <GenericCarousel
                  emblaRef={emblaRef}
                  emblaApi={emblaApi}
                  sx={styles.carouselViewport}
                  // gap="12px"
               >
                  {SLIDES.map((slide, idx) => (
                     <GenericCarousel.Slide
                        key={idx}
                        sx={{
                           // width: "100%",
                           height: "327px",
                        }}
                     >
                        <Box
                           component="img"
                           src={slide.imageUrl}
                           alt={slide.title}
                           sx={[
                              styles.slideImage,
                              {
                                 opacity: currentSlide === idx ? 1 : 0,
                                 transition: "opacity 0.3s ease-in-out",
                              },
                           ]}
                        />
                     </GenericCarousel.Slide>
                  ))}
               </GenericCarousel>

               {/* Dots */}
               <Box sx={styles.dotsContainer}>
                  {SLIDES.map((_, index) => (
                     <Box
                        key={index}
                        sx={[
                           styles.dot,
                           index === currentSlide && styles.dotActive,
                        ]}
                        onClick={() => handleDotClick(index)}
                     />
                  ))}
               </Box>

               {/* Animated Slide Text */}
               <Box sx={styles.slideText}>
                  <AnimatePresence mode="wait">
                     <FramerBox
                        key={currentSlide}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={textAnimationVariants}
                     >
                        <Typography sx={styles.slideTitle}>
                           {SLIDES[currentSlide].title}
                        </Typography>
                        <Typography sx={styles.slideDescription}>
                           {SLIDES[currentSlide].description}
                        </Typography>
                     </FramerBox>
                  </AnimatePresence>
               </Box>
            </Stack>
         </Stack>
         {/* CTA Section */}
         <Box sx={styles.ctaSection}>
            <Button
               onClick={handleGetStarted}
               sx={styles.primaryButton}
               variant="contained"
               fullWidth
            >
               Get started!
            </Button>
            <Button
               onClick={handleExploreApp}
               sx={styles.secondaryButton}
               variant="text"
               fullWidth
            >
               Explore the app
            </Button>
         </Box>
      </Dialog>
   )
}

// Hook to manage the login nudge overlay state
export const useLoginNudgeOverlay = () => {
   const { isLoggedOut, isLoadingAuth } = useAuth()
   const webviewResumedCount = useTrackWebviewResumedCount()
   const [hasBeenDismissed, setHasBeenDismissed] = useState(false)

   // eslint-disable-next-line react/hook-use-state
   const [initialWebviewCount] = useState(() => webviewResumedCount)

   // Hide overlay when webview resumes (user switches back to app)
   useEffect(() => {
      if (webviewResumedCount > initialWebviewCount) {
         setHasBeenDismissed(true)
      }
   }, [webviewResumedCount, initialWebviewCount])

   const shouldShow =
      // MobileUtils.webViewPresence() &&
      isLoggedOut && !isLoadingAuth && !hasBeenDismissed

   const handleDismiss = useCallback(() => {
      setHasBeenDismissed(true)
   }, [])

   return {
      shouldShow,
      handleDismiss,
   }
}
