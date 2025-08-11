import { Box, Button, Stack, Theme, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useTrackWebviewResumedCount } from "components/custom-hook/utils/useTrackWebviewResumed"
import { MainLogo } from "components/logos"
import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/router"
import {
   ReactNode,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"
import { MobileUtils } from "util/mobile.utils"

const SLIDE_DURATION = 5000
const DISABLE_AUTO_ADVANCE = false

// Slide data constants
const SLIDES = [
   {
      title: "Money, Flexibility or Purpose?",
      description:
         "Tell us who you are to discover companies that offer what you want",
      imageUrl: "/illustrations/nudge-image-1-icons.png",
      backgroundColor: (theme: Theme) => theme.brand.purple[600],
   },
   {
      title: "Startup hoodie, suit or a lab coat?",
      description:
         "Show us what you're into to meet companies that match your energy",
      imageUrl: "/illustrations/nudge-image-2-icons.png",
      backgroundColor: (theme: Theme) => theme.palette.warning[600],
   },
   {
      title: "Analyst, Consultant or Marketer?",
      description:
         "Set up your profile to receive live stream recommendations made for your path",
      imageUrl: "/illustrations/nudge-image-3-icons.png",
      backgroundColor: (theme: Theme) => theme.brand.info[600],
   },
]

const styles = sxStyles({
   header: {
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      px: "24px",
      pt: "56px",
      pb: "24px",
   },
   loginButton: {
      backgroundColor: "rgba(252, 252, 254, 0.43)",
      backdropFilter: "blur(200px)",
      borderRadius: "18px",
      padding: "8px 16px",
      color: (theme) => theme.brand.white[100],
      textTransform: "none",
      fontSize: "14px",
      fontWeight: 400,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.primary[800],
      },
   },
   content: {
      gap: "16px",
      padding: "0 24px",
      justifyContent: "flex-start",
   },
   carouselContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: "9/10",
      borderRadius: "12px",
      overflow: "hidden",
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
      backgroundColor: (theme) => theme.brand.white[300],
   },
   slideText: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      width: "100%",
      minHeight: "145px",
   },
   slideTitle: {
      color: (theme) => theme.brand.white[200],
      fontSize: "30px",
      fontWeight: 800,
      lineHeight: "34px",
      letterSpacing: "-0.9px",
      textTransform: "uppercase",
      textAlign: "left",
   },
   slideDescription: {
      color: (theme) => theme.brand.white[500],
      fontWeight: 400,
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
})

// Animation variants for text transitions
const textAnimationVariants = {
   initial: {
      opacity: 0,
   },
   animate: {
      opacity: 1,
      transition: {
         duration: 0.4,
         ease: "easeOut",
      },
   },
   exit: {
      opacity: 0,
      transition: {
         duration: 0.4,
         ease: "easeOut",
      },
   },
}

// Animation variants for slide images
const slideAnimationVariants = {
   initial: {
      opacity: 0,
   },
   animate: {
      opacity: 1,
      transition: {
         duration: 0.4,
         ease: "easeOut",
      },
   },
   exit: {
      opacity: 0,
      transition: {
         duration: 0.4,
         ease: "easeOut",
      },
   },
}

// Animation variants for expanding circle reveal
const circleExpandVariants = {
   initial: {
      scale: 0,
   },
   animate: {
      scale: 50, // Large enough to cover screen
      transition: {
         duration: 0.8,
         ease: [0.4, 0, 0.2, 1],
      },
   },
}

// Animation variants for dialog background - simplified without backgroundColor
const getBackgroundVariants = (isInitial: boolean = false) => ({
   initial: {
      opacity: isInitial ? 1 : 1, // Keep opacity consistent
   },
   animate: {
      opacity: 1,
      transition: {
         duration: 0.6,
         ease: "easeInOut",
      },
   },
   exit: {
      opacity: 0,
      transition: {
         duration: 0.6,
         ease: "easeOut",
      },
   },
})

// Animation variants for dialog content
const contentVariants = {
   initial: {
      opacity: 0,
   },
   animate: {
      opacity: 1,
      transition: {
         duration: 0.6,
         ease: "easeOut",
         delay: 0.3,
      },
   },
   exit: {
      opacity: 0,
      transition: {
         duration: 0.4,
         ease: "easeOut",
      },
   },
}

// Hook to manage the login nudge overlay state
export const useLoginNudgeOverlay = () => {
   const { isLoggedOut, isLoadingAuth } = useAuth()
   const { pathname } = useRouter()
   const webviewResumedCount = useTrackWebviewResumedCount()
   const [hasBeenDismissed, setHasBeenDismissed] = useState(false)
   const [isDismissing, setIsDismissing] = useState(false)

   // eslint-disable-next-line react/hook-use-state
   const [initialWebviewCount] = useState(() => webviewResumedCount)

   const shouldShow = useMemo(() => {
      // Only show on portal paths (including subpaths)
      if (!pathname.startsWith("/portal")) return false

      // Don't show if manually dismissed (but keep showing while dismissing for animation)
      if (hasBeenDismissed && !isDismissing) return false

      // Don't show if we're not in a webview
      if (!MobileUtils.webViewPresence()) return false

      // Don't show if auth is still loading
      if (isLoadingAuth) return false

      // Once auth has loaded, only show if user is logged out
      return isLoggedOut
   }, [isLoggedOut, isLoadingAuth, hasBeenDismissed, isDismissing, pathname])

   const handleDismiss = useCallback(() => {
      setHasBeenDismissed(true)
   }, [])

   const handleDismissWithAnimation = useCallback(() => {
      setIsDismissing(true)
   }, [])

   const handleAnimationComplete = useCallback(() => {
      if (isDismissing) {
         setHasBeenDismissed(true)
         setIsDismissing(false)
      }
   }, [isDismissing])

   // Hide overlay when webview resumes (user switches back to app)
   useEffect(() => {
      if (webviewResumedCount > initialWebviewCount) {
         handleDismissWithAnimation()
      }
   }, [webviewResumedCount, initialWebviewCount, handleDismissWithAnimation])

   // Dismiss overlay when page visibility changes (simulates app backgrounding)
   useEffect(() => {
      const handleVisibilityChange = () => {
         // Only dismiss if page becomes visible AND overlay is currently showing
         if (
            !document.hidden &&
            shouldShow &&
            !hasBeenDismissed &&
            !isDismissing
         ) {
            setTimeout(() => {
               handleDismissWithAnimation()
            }, 100) // Small delay to simulate realistic behavior
         }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)
      return () => {
         document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
         )
      }
   }, [handleDismissWithAnimation, shouldShow, hasBeenDismissed, isDismissing])

   return {
      shouldShow,
      handleDismiss,
      handleDismissWithAnimation,
      handleAnimationComplete,
      isDismissing,
   }
}

type LoginNudgeOverlayProps = {
   children: ReactNode
}

/**
 * Login Nudge Overlay, displayed only on the webview.
 *
 * The slides are swipeable and auto-advance every 5 seconds. For this our
 * GenericCarousel was not used, as during its swiping the animation would not match.
 *
 * @param children - The children to render inside the overlay
 */
export const LoginNudgeOverlay = ({ children }: LoginNudgeOverlayProps) => {
   const {
      shouldShow,
      handleDismiss,
      handleDismissWithAnimation,
      handleAnimationComplete,
      isDismissing,
   } = useLoginNudgeOverlay()
   const router = useRouter()
   const { isLoadingAuth, isLoadingUserData } = useAuth()
   const [currentSlide, setCurrentSlide] = useState(0)
   const [isInitialLoad, setIsInitialLoad] = useState(true)
   const [showInitialTransition, setShowInitialTransition] = useState(true)
   const timerRef = useRef<NodeJS.Timeout | null>(null)
   const touchStartX = useRef<number | null>(null)
   const touchEndX = useRef<number | null>(null)

   // Auto-advance slides every 5 seconds with timer reset
   const startAutoAdvance = useCallback(() => {
      if (timerRef.current) {
         clearTimeout(timerRef.current)
      }
      if (DISABLE_AUTO_ADVANCE) return

      timerRef.current = setTimeout(() => {
         setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
      }, SLIDE_DURATION)
   }, [])

   const resetTimer = useCallback(() => {
      if (timerRef.current) {
         clearTimeout(timerRef.current)
      }
      startAutoAdvance()
   }, [startAutoAdvance])

   // Touch event handlers for swipe detection
   const handleTouchStart = useCallback((e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
   }, [])

   const handleTouchMove = useCallback((e: React.TouchEvent) => {
      touchEndX.current = e.touches[0].clientX
   }, [])

   const handleTouchEnd = useCallback(() => {
      if (touchStartX.current === null || touchEndX.current === null) return

      const deltaX = touchStartX.current - touchEndX.current
      const minSwipeDistance = 50

      if (Math.abs(deltaX) > minSwipeDistance) {
         if (deltaX > 0) {
            // Swipe left - next slide
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
         } else {
            // Swipe right - previous slide
            setCurrentSlide(
               (prev) => (prev - 1 + SLIDES.length) % SLIDES.length
            )
         }
         resetTimer()
      }

      touchStartX.current = null
      touchEndX.current = null
   }, [resetTimer])

   const handleLogin = useCallback(() => {
      // Reset fullscreen immediately before navigation
      if (MobileUtils.webViewPresence()) {
         MobileUtils.toggleFullscreen(false)
      }
      router.push("/login").then(() => {
         handleDismiss()
      })
   }, [handleDismiss, router])

   const handleGetStarted = useCallback(() => {
      // Reset fullscreen immediately before navigation
      if (MobileUtils.webViewPresence()) {
         MobileUtils.toggleFullscreen(false)
      }
      router.push("/signup").then(() => {
         handleDismiss()
      })
   }, [handleDismiss, router])

   const handleExploreApp = useCallback(() => {
      // Reset fullscreen immediately before dismissal
      if (MobileUtils.webViewPresence()) {
         MobileUtils.toggleFullscreen(false)
      }
      handleDismissWithAnimation()
      // Continue as logged out user
   }, [handleDismissWithAnimation])

   const handleDotClick = useCallback(
      (index: number) => {
         setCurrentSlide(index)
         resetTimer()
      },
      [resetTimer]
   )

   // Control fullscreen mode directly in the overlay component
   useEffect(() => {
      if (MobileUtils.webViewPresence()) {
         MobileUtils.toggleFullscreen(shouldShow)
      }

      // Cleanup: ensure fullscreen is disabled when component unmounts
      return () => {
         if (MobileUtils.webViewPresence()) {
            MobileUtils.toggleFullscreen(false)
         }
      }
   }, [shouldShow])

   // Handle initial load completion
   useEffect(() => {
      if (isInitialLoad && shouldShow) {
         // Start transitioning background to purple during circle animation
         const initialTransitionTimer = setTimeout(() => {
            setShowInitialTransition(false) // This triggers the white->purple transition
         }, 200) // Start transition when circle animation starts

         const completeTimer = setTimeout(() => {
            setIsInitialLoad(false)
            // Background is already purple at this point, no additional transition needed
         }, 1000) // Wait for initial circle animation to complete

         return () => {
            clearTimeout(initialTransitionTimer)
            clearTimeout(completeTimer)
         }
      }
   }, [isInitialLoad, shouldShow])

   // Start auto-advance when component mounts
   useEffect(() => {
      if (shouldShow) {
         startAutoAdvance()
      }

      return () => {
         if (timerRef.current) {
            clearTimeout(timerRef.current)
         }
      }
   }, [shouldShow, startAutoAdvance])

   // Reset timer when slide changes
   useEffect(() => {
      resetTimer()
   }, [currentSlide, resetTimer])

   if (isLoadingAuth || isLoadingUserData) return children

   if (!shouldShow) return children

   return (
      <AnimatePresence>
         <FramerBox
            initial="initial"
            animate={isDismissing ? "exit" : "animate"}
            exit="exit"
            variants={getBackgroundVariants(isInitialLoad)}
            sx={{
               backgroundColor: (theme) => {
                  if (isInitialLoad && showInitialTransition) {
                     return "#FFFFFF" // Start with white
                  }
                  // After first render, use slide show colors
                  return SLIDES.length > 0 && currentSlide >= 0
                     ? SLIDES[currentSlide].backgroundColor(theme)
                     : theme.palette.primary.main
               },
               transition: isInitialLoad
                  ? "background-color 0.1s ease-in-out 0.2s" // Fast transition during circle animation
                  : "background-color 0.6s ease-in-out", // Normal transition for slide changes
            }}
         >
            {/* Expanding Circle - only show during initial load */}
            {isInitialLoad ? (
               <FramerBox
                  initial="initial"
                  animate="animate"
                  variants={circleExpandVariants}
                  sx={{
                     position: "fixed",
                     top: "50%",
                     left: "50%",
                     width: "40px",
                     height: "40px",
                     backgroundColor: (theme) =>
                        SLIDES[0].backgroundColor(theme), // Use first slide color
                     borderRadius: "50%",
                     transform: "translate(-50%, -50%)",
                     transformOrigin: "center",
                     zIndex: 1,
                  }}
               />
            ) : null}

            {/* Dialog Content */}
            <FramerBox
               initial="initial"
               animate={isDismissing ? "exit" : "animate"}
               exit="exit"
               variants={contentVariants}
               onAnimationComplete={() => {
                  if (isDismissing) {
                     handleAnimationComplete()
                  }
               }}
               sx={{
                  position: "relative",
                  zIndex: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
               }}
            >
               <Stack minHeight={"100dvh"} justifyContent={"space-between"}>
                  <Box m={0} p={0}>
                     {/* Header */}
                     <Stack sx={styles.header} direction={"row"}>
                        <MainLogo white />
                        <Button onClick={handleLogin} sx={styles.loginButton}>
                           Login
                        </Button>
                     </Stack>

                     {/* Content */}
                     <Stack sx={styles.content} alignItems={"space-between"}>
                        <Stack spacing={"12px"}>
                           {/* Carousel Container with Touch Events */}
                           <Box
                              sx={styles.carouselContainer}
                              onTouchStart={handleTouchStart}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                           >
                              <AnimatePresence>
                                 <FramerBox
                                    key={currentSlide}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    variants={slideAnimationVariants}
                                    sx={{
                                       position: "absolute",
                                       top: 0,
                                       left: 0,
                                       width: "100%",
                                       height: "100%",
                                       zIndex: currentSlide + 1, // Ensure new slide appears on top
                                    }}
                                 >
                                    <Image
                                       src={SLIDES[currentSlide].imageUrl}
                                       alt={SLIDES[currentSlide].title}
                                       fill
                                       priority
                                       style={{
                                          borderRadius: "12px",
                                          objectFit: "cover",
                                          objectPosition: "center",
                                       }}
                                    />
                                 </FramerBox>
                              </AnimatePresence>
                           </Box>

                           {/* Dots */}
                           <Box sx={styles.dotsContainer}>
                              {SLIDES.map((_, index) => (
                                 <Box
                                    key={index}
                                    sx={[
                                       styles.dot,
                                       index === currentSlide &&
                                          styles.dotActive,
                                    ]}
                                    onClick={() => handleDotClick(index)}
                                 />
                              ))}
                           </Box>

                           {/* Animated Slide Text */}
                           <Box sx={styles.slideText}>
                              <AnimatePresence>
                                 <FramerBox
                                    key={currentSlide}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    variants={textAnimationVariants}
                                    sx={{
                                       position: "absolute",
                                       width: "100%",
                                       zIndex: currentSlide + 1, // Ensure new text appears on top
                                    }}
                                 >
                                    <Typography sx={styles.slideTitle}>
                                       {SLIDES[currentSlide].title}
                                    </Typography>
                                    <Typography
                                       variant="medium"
                                       sx={styles.slideDescription}
                                    >
                                       {SLIDES[currentSlide].description}
                                    </Typography>
                                 </FramerBox>
                              </AnimatePresence>
                           </Box>
                        </Stack>
                     </Stack>
                  </Box>
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
                        variant="text"
                        color="grey"
                        fullWidth
                     >
                        Explore the app
                     </Button>
                  </Box>
               </Stack>
            </FramerBox>
         </FramerBox>
      </AnimatePresence>
   )
}
