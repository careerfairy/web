import { Fab, Grow, SvgIcon } from "@mui/material"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import useIsMobile from "components/custom-hook/useIsMobile"
import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence } from "framer-motion"
import { Fragment, useState } from "react"
import { MainStar } from "./MainStar"
import { RotatingDecorativeStar } from "./RotatingDecorativeStar"
import { ANIMATION_CONFIG } from "./animationConfig"

enum AnimationPhase {
   /**
    * Initial state - no animation is playing and the container is empty
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

const PAUSE_MID_ANIMATION = false

export const RegistrationSuccessAnimation = () => {
   const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(
      AnimationPhase.NOT_STARTED
   )
   const [isAnimating, setIsAnimating] = useState(false)
   const isMobile = useIsMobile()

   const startAnimation = () => {
      setIsAnimating(true)
      setAnimationPhase(AnimationPhase.FIRST_PHASE)
   }

   const resetAnimation = () => {
      setAnimationPhase(AnimationPhase.NOT_STARTED)
      setIsAnimating(false)
   }

   // Handle animation phase transition
   const handleAnimationComplete = () => {
      switch (animationPhase) {
         case AnimationPhase.FIRST_PHASE:
            if (PAUSE_MID_ANIMATION) {
               // Do nothing
            } else {
               // When phase 1 animation completes, move to phase 2 after delay
               setTimeout(() => {
                  setAnimationPhase(AnimationPhase.SECOND_PHASE)
               }, ANIMATION_CONFIG.container.delayBeforeExit)
            }
            break
         case AnimationPhase.SECOND_PHASE:
            resetAnimation()
            break
      }
   }

   return (
      <Box
         display="flex"
         justifyContent="center"
         alignItems="center"
         width="100%"
         height="100%"
      >
         <AnimatePresence mode="sync">
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
                              : "-120%", // Increased from -100% to -120% for complete exit
                     }}
                     exit={{
                        opacity: 0,
                        y: "-120%", // Increased from -100% to -120% for complete exit
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
                     sx={{
                        position: "absolute",
                        width: "100%",
                        height: "300%",
                        borderRadius: "5px",
                        background:
                           "linear-gradient(to bottom, #46C3B0, #ADE3DB)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                     }}
                  >
                     {/* Main star at the top of container */}
                     <Box
                        sx={{
                           position: "absolute",
                           top: isMobile ? -150 : -400,
                           left: "50%",
                           transform: "translateX(-50%)",
                           width: "100%",
                           height: "auto",
                        }}
                     >
                        <MainStar sx={{ width: "100%", height: "auto" }} />
                     </Box>

                     {/* Light effect */}
                     <FramerBox
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        transition={{
                           delay: ANIMATION_CONFIG.lightEffect.delay,
                           duration: ANIMATION_CONFIG.lightEffect.duration,
                        }}
                        sx={{
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           borderRadius: "50%",
                           background:
                              "radial-gradient(circle, white 0%, rgba(255,255,255,0) 70%)",
                        }}
                     />
                  </FramerBox>
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
                  />

                  {/* Decorative star 2 */}
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
                  />

                  {/* Decorative star 3 */}
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
                                 ? ANIMATION_CONFIG.container.slideOut
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
                     <Typography
                        variant="h4"
                        sx={{
                           fontWeight: 900,
                           color: "common.white",
                           textTransform: "uppercase",
                           fontSize: { xs: "2.714rem", md: "4.571rem" },
                           lineHeight: { xs: "2.429rem", md: "5rem" },
                           textAlign: "center",
                        }}
                     >
                        Registration
                        <br />
                        successful
                     </Typography>
                  </FramerBox>
               </Fragment>
            )}
         </AnimatePresence>

         {/* Floating Action Button */}
         <Grow in={!isAnimating}>
            <Fab
               color="primary"
               aria-label="show success animation"
               onClick={startAnimation}
               sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 10,
               }}
            >
               <PlayArrowIcon />
            </Fab>
         </Grow>
      </Box>
   )
}

const PlayArrowIcon = () => (
   <SvgIcon>
      <svg
         xmlns="http://www.w3.org/2000/svg"
         height="24"
         viewBox="0 -960 960 960"
         width="24"
      >
         <path d="M320-203v-560l440 280-440 280Z" fill="currentColor" />
      </svg>
   </SvgIcon>
)
