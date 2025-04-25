import { Fab } from "@mui/material"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import useIsMobile from "components/custom-hook/useIsMobile"
import FramerBox from "components/views/common/FramerBox"
import PlayIcon from "components/views/common/icons/PlayIcon"
import { AnimatePresence } from "framer-motion"
import { Fragment, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { MainStar } from "./MainStar"
import { RotatingDecorativeStar } from "./RotatingDecorativeStar"
import { ANIMATION_CONFIG } from "./animationConfig"

const styles = sxStyles({
   root: {
      overflow: "hidden",
      position: "absolute",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   debugButton: {
      position: "absolute",
      bottom: 16,
      left: 16,
      zIndex: 10,
   },
   successContainer: {
      position: "absolute",
      width: "100%",
      height: "300%",
      borderRadius: "5px",
      background: "linear-gradient(180deg, #46C3B0 16.87%, #ADE3DB 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
   mainStarContainer: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      height: "auto",
      display: "flex",
      justifyContent: "center",
   },
   mainStar: {
      width: "105%",
      height: "auto",
   },
   successText: {
      fontWeight: 900,
      color: "common.white",
      textTransform: "uppercase",
      fontSize: { xs: "2.714rem", md: "4.571rem" },
      lineHeight: { xs: "2.429rem", md: "5rem" },
      textAlign: "center",
   },
})

enum AnimationPhase {
   /**
    * Initial/Final state - no animation is playing and the container is empty
    */
   NOT_STARTED,
   /**
    * First animation phase - success animation slides up into the container and plays
    * with star and text elements appearing with various effects
    */
   FIRST_PHASE,
   /**
    * Second animation phase - after a delay, the animation slides up and out of the container
    * returning to the initial state once complete
    */
   SECOND_PHASE,
}

/**
 * Used for development and debugging purposes.
 */
const PAUSE_AFTER_FIRST_PHASE = false

type Props = {
   /**
    * Callback fired when animation completes
    */
   onAnimationComplete?: () => void
   onAnimationFullScreen?: () => void
   /**
    * When true, enables debugging control
    */
   debug?: boolean
}

/**
 * A celebratory animation shown after successful registration.
 *
 * The animation has two phases:
 * 1. Entry: Stars and text slide up with various effects
 * 2. Exit: After a delay, animation slides out of view
 *
 * @param onAnimationComplete - Callback fired when animation completes
 * @param debug - When true, enables debugging controls
 *
 * @example
 * ```tsx
 * // In LivestreamDialog.tsx
 * {activeView === "recommendations" && (
 *   <RegistrationSuccessAnimation
 *     onAnimationComplete={() => doSomethingAfterAnimation()}
 *   />
 * )}
 * ```
 */
export const RegistrationSuccessAnimation = ({
   onAnimationComplete,
   onAnimationFullScreen,
   debug = false,
}: Props) => {
   const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(
      AnimationPhase.FIRST_PHASE
   )
   const [animationResetKey, setAnimationResetKey] = useState(0)

   const isMobile = useIsMobile()

   const triggerAnimation = () => {
      setAnimationPhase(AnimationPhase.FIRST_PHASE)
      setAnimationResetKey((prevKey) => prevKey + 1)
   }

   const resetAnimation = () => {
      setAnimationPhase(AnimationPhase.NOT_STARTED)
   }

   const handleAnimationComplete = () => {
      switch (animationPhase) {
         case AnimationPhase.FIRST_PHASE:
            if (PAUSE_AFTER_FIRST_PHASE) {
               // Do nothing
            } else {
               // When phase 1 animation completes, move to phase 2 after delay
               setTimeout(() => {
                  setAnimationPhase(AnimationPhase.SECOND_PHASE)
               }, ANIMATION_CONFIG.container.delayBeforeExit)
            }
            onAnimationFullScreen?.()
            break
         case AnimationPhase.SECOND_PHASE:
            resetAnimation()
            break
      }
   }

   return (
      <Box
         key={animationResetKey}
         sx={[
            styles.root,
            {
               pointerEvents: debug
                  ? "auto"
                  : animationPhase === AnimationPhase.NOT_STARTED
                  ? "none"
                  : "auto",
            },
         ]}
      >
         <AnimatePresence onExitComplete={onAnimationComplete} mode="sync">
            {animationPhase > AnimationPhase.NOT_STARTED && (
               <Fragment>
                  <FramerBox
                     key="success-container"
                     initial={{
                        opacity: 1,
                        y: "100%", // Start from below the container
                     }}
                     animate={{
                        opacity: 1,
                        y:
                           animationPhase === AnimationPhase.FIRST_PHASE
                              ? 0
                              : "-120%", // Increased from -100% to -120% to completely exit the container
                     }}
                     exit={{
                        opacity: 0,
                        y: "-120%", // Increased from -100% to -120% to completely exit the container
                     }}
                     transition={{
                        y: {
                           duration:
                              animationPhase === AnimationPhase.FIRST_PHASE
                                 ? ANIMATION_CONFIG.container.slideIn
                                 : ANIMATION_CONFIG.container.slideOut,
                           ease:
                              animationPhase === AnimationPhase.FIRST_PHASE
                                 ? "easeOut"
                                 : "easeInOut",
                           type: "tween", // Added for consistent motion
                        },
                        opacity: {
                           duration: ANIMATION_CONFIG.container.opacity,
                        }, // Added for smoother fade
                     }}
                     onAnimationComplete={handleAnimationComplete}
                     sx={styles.successContainer}
                  >
                     <Box
                        sx={styles.mainStarContainer}
                        top={isMobile ? -150 : -320}
                     >
                        <MainStar sx={styles.mainStar} />
                     </Box>
                  </FramerBox>

                  {/* Mid left star: decorative-star-1 */}
                  <RotatingDecorativeStar
                     key="decorative-star-1"
                     top={isMobile ? "-10%" : "-17%"}
                     left={isMobile ? "-13%" : "-23%"}
                     color="#1FB6A0"
                     size={isMobile ? 193 : 471}
                     opacity={0.2}
                     index={0}
                     isAnimating={animationPhase > AnimationPhase.NOT_STARTED}
                     exitAnimation={
                        animationPhase === AnimationPhase.SECOND_PHASE
                     }
                     startRotation={
                        ANIMATION_CONFIG.stars.midLeft.startRotation
                     }
                     endRotation={ANIMATION_CONFIG.stars.midLeft.endRotation}
                     rotationDuration={
                        ANIMATION_CONFIG.stars.rotationDuration * 1000
                     }
                     animationEasing="easeOut"
                     appearDelay={ANIMATION_CONFIG.stars.delay * 1000}
                     appearDuration={ANIMATION_CONFIG.stars.duration * 1000}
                  />

                  {/* Bottom right star: decorative-star-2 */}
                  <RotatingDecorativeStar
                     key="decorative-star-2"
                     bottom={isMobile ? "-17%" : "-28%"}
                     right={isMobile ? "-13%" : "-26%"}
                     color="#1FA692"
                     size={isMobile ? 236 : 575}
                     opacity={0.3}
                     index={1}
                     isAnimating={animationPhase > AnimationPhase.NOT_STARTED}
                     exitAnimation={
                        animationPhase === AnimationPhase.SECOND_PHASE
                     }
                     // Star-specific rotation values from config
                     startRotation={
                        ANIMATION_CONFIG.stars.bottomRight.startRotation
                     }
                     endRotation={
                        ANIMATION_CONFIG.stars.bottomRight.endRotation
                     }
                     rotationDuration={
                        ANIMATION_CONFIG.stars.rotationDuration * 1000
                     }
                     animationEasing="easeOut"
                     appearDelay={ANIMATION_CONFIG.stars.delay * 1000}
                     appearDuration={ANIMATION_CONFIG.stars.duration * 1000}
                  />

                  {/* Top right star: decorative-star-3 */}
                  <RotatingDecorativeStar
                     key="decorative-star-3"
                     top={isMobile ? "-7%" : "-17%"}
                     right={isMobile ? "-6%" : "-10%"}
                     color="#3EB9A7"
                     size={isMobile ? 112 : 275}
                     opacity={0.3}
                     index={2}
                     isAnimating={animationPhase > AnimationPhase.NOT_STARTED}
                     exitAnimation={
                        animationPhase === AnimationPhase.SECOND_PHASE
                     }
                     startRotation={
                        ANIMATION_CONFIG.stars.topRight.startRotation
                     }
                     endRotation={ANIMATION_CONFIG.stars.topRight.endRotation}
                     rotationDuration={
                        ANIMATION_CONFIG.stars.rotationDuration * 1000
                     }
                     animationEasing="easeOut"
                     appearDelay={ANIMATION_CONFIG.stars.delay * 1000}
                     appearDuration={ANIMATION_CONFIG.stars.duration * 1000}
                  />

                  {/* Text */}
                  <FramerBox
                     key="text"
                     zIndex={1}
                     initial={{
                        opacity: 0,
                        y: 50,
                     }}
                     animate={{
                        opacity:
                           animationPhase === AnimationPhase.SECOND_PHASE
                              ? 0
                              : animationPhase > AnimationPhase.NOT_STARTED
                              ? 1
                              : 0,
                        y:
                           animationPhase === AnimationPhase.SECOND_PHASE
                              ? "-120%"
                              : animationPhase > AnimationPhase.NOT_STARTED
                              ? 0
                              : 50,
                     }}
                     transition={{
                        opacity: {
                           duration:
                              animationPhase === AnimationPhase.SECOND_PHASE
                                 ? ANIMATION_CONFIG.container.slideOut
                                 : ANIMATION_CONFIG.text.duration,
                           delay:
                              animationPhase === AnimationPhase.SECOND_PHASE
                                 ? 0
                                 : ANIMATION_CONFIG.text.delay,
                        },
                        y: {
                           duration:
                              animationPhase === AnimationPhase.SECOND_PHASE
                                 ? ANIMATION_CONFIG.container.slideOut * 0.5
                                 : ANIMATION_CONFIG.text.duration,
                           delay:
                              animationPhase === AnimationPhase.SECOND_PHASE
                                 ? 0
                                 : ANIMATION_CONFIG.text.delay,
                           ease:
                              animationPhase === AnimationPhase.SECOND_PHASE
                                 ? "easeInOut"
                                 : "easeOut",
                        },
                     }}
                  >
                     <Typography component="h4" sx={styles.successText}>
                        Registration
                        <br />
                        successful
                     </Typography>
                  </FramerBox>
               </Fragment>
            )}
         </AnimatePresence>

         {Boolean(debug) && (
            <Fab
               color="primary"
               aria-label="show success animation"
               onClick={triggerAnimation}
               sx={styles.debugButton}
            >
               <PlayIcon />
            </Fab>
         )}
      </Box>
   )
}
