import { Fab, Grow, SvgIcon, SvgIconProps } from "@mui/material"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import useIsMobile from "components/custom-hook/useIsMobile"
import { AnimatePresence } from "framer-motion"
import { NextPage } from "next"
import { useState } from "react"
import FramerBox from "../components/views/common/FramerBox"

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

const ANIMATION_CONFIG = {
   container: {
      slideIn: 0.3,
      slideOut: 0.8,
      opacity: 0.3,
      delayBeforeExit: 3000,
   },
   lightEffect: {
      delay: 0.6,
      duration: 0.6,
   },
   text: {
      duration: 0.5,
      delay: 0.3,
   },
   stars: {
      duration: 0.6,
      delay: 0.15,
      staggerDelay: 0.1,
   },
}

type RotatingDecorativeStarProps = {
   top?: string | number
   left?: string | number
   right?: string | number
   bottom?: string | number
   color?: string
   size?: number
   opacity?: number | string
   index?: number
   isAnimating?: boolean
   exitAnimation?: boolean
}

const RotatingDecorativeStar = ({
   top,
   left,
   right,
   bottom,
   color,
   size,
   opacity,
   index = 0,
   isAnimating = false,
   exitAnimation = false,
}: RotatingDecorativeStarProps) => {
   // Calculate starting position based on placement
   // Stars will slide in from the direction they're positioned
   const getInitialOffset = () => {
      const offset = "10%" // How far the stars will slide in from the direction they're positioned
      if (left !== undefined) return { x: `-${offset}`, y: 0 }
      if (right !== undefined) return { x: offset, y: 0 }
      if (top !== undefined) return { x: 0, y: `-${offset}` }
      if (bottom !== undefined) return { x: 0, y: offset }
      return { x: 0, y: 0 }
   }

   const initialOffset = getInitialOffset()

   return (
      <FramerBox
         initial={{
            opacity: 0,
            x: initialOffset.x,
            y: initialOffset.y,
         }}
         animate={{
            opacity: exitAnimation ? 0 : isAnimating ? opacity : 0,
            x: 0,
            y: exitAnimation ? "-120%" : 0,
            rotate: exitAnimation ? 360 : 360,
         }}
         transition={{
            opacity: {
               duration: exitAnimation
                  ? ANIMATION_CONFIG.container.slideOut
                  : ANIMATION_CONFIG.stars.duration,
               delay: exitAnimation
                  ? 0
                  : ANIMATION_CONFIG.stars.delay +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
            },
            x: {
               duration: ANIMATION_CONFIG.stars.duration,
               delay:
                  ANIMATION_CONFIG.stars.delay +
                  index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: "easeOut",
            },
            y: {
               duration: exitAnimation
                  ? ANIMATION_CONFIG.container.slideOut
                  : ANIMATION_CONFIG.stars.duration,
               delay: exitAnimation
                  ? 0
                  : ANIMATION_CONFIG.stars.delay +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: exitAnimation ? "easeInOut" : "easeOut",
            },
            rotate: {
               duration: 6,
               repeat: Infinity,
               ease: "linear",
            },
         }}
         sx={{
            position: "absolute",
            top: top,
            left: left,
            right: right,
            bottom: bottom,
         }}
      >
         <DecorativeStar
            sx={{ color, width: size, height: size, opacity: 1 }}
         />
      </FramerBox>
   )
}

const TempPage: NextPage = () => {
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
      <div
         style={{
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
         }}
      >
         {/* Container with visible borders */}
         <Box
            sx={{
               width: { xs: "100%", md: 914 },
               height: { md: 907 },
               border: "2px dashed #ccc",
               borderRadius: "20px",
               position: "relative",
               overflow: "hidden", // Important to clip content
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               backgroundColor: "#f5f5f5",
               ...(isMobile && {
                  display: "flex",
                  flex: 1,
                  borderRadius: 0,
               }),
            }}
         >
            <AnimatePresence mode="sync">
               {animationPhase > AnimationPhase.NOT_STARTED && (
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
               )}

               {/* Stars positioned directly in the container */}
               {/* Decorative star 1 */}
               <RotatingDecorativeStar
                  key="decorative-star-1"
                  top={isMobile ? "-10%" : "-17%"}
                  left={isMobile ? "-13%" : "-23%"}
                  color="#1FB6A0"
                  size={isMobile ? 193 : 471}
                  opacity={0.2}
                  index={0}
                  isAnimating={animationPhase > AnimationPhase.NOT_STARTED}
                  exitAnimation={animationPhase === AnimationPhase.SECOND_PHASE}
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
                  exitAnimation={animationPhase === AnimationPhase.SECOND_PHASE}
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
                  exitAnimation={animationPhase === AnimationPhase.SECOND_PHASE}
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
            </AnimatePresence>
         </Box>

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
      </div>
   )
}

const MainStar = (props: SvgIconProps) => {
   const isMobile = useIsMobile()

   if (isMobile) {
      return (
         <SvgIcon viewBox="0 0 375 358" {...props}>
            <svg
               width="375"
               height="358"
               viewBox="0 0 375 358"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  d="M172.283 11.8328C177.073 -2.90821 197.927 -2.90815 202.717 11.8328L235.883 113.907C238.025 120.499 244.168 124.963 251.1 124.963H358.427C373.926 124.963 380.371 144.796 367.831 153.907L281.002 216.992C275.394 221.066 273.048 228.288 275.19 234.881L308.355 336.955C313.145 351.696 296.273 363.954 283.734 354.843L196.905 291.758C191.297 287.684 183.703 287.684 178.095 291.758L91.2661 354.843C78.7267 363.954 61.855 351.696 66.6446 336.955L99.8105 234.881C101.952 228.288 99.6059 221.066 93.9981 216.992L7.16875 153.907C-5.37067 144.796 1.07378 124.963 16.5734 124.963H123.9C130.832 124.963 136.975 120.499 139.117 113.907L172.283 11.8328Z"
                  fill="#2ABAA5"
               />
            </svg>
         </SvgIcon>
      )
   }

   return (
      <SvgIcon viewBox="0 0 914 960" {...props}>
         <svg
            width="914"
            height="960"
            viewBox="0 0 914 960"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M441.784 11.8178C446.574 -2.92144 467.427 -2.92143 472.217 11.8178L580.088 343.714C582.23 350.305 588.373 354.768 595.305 354.768H944.373C959.873 354.768 966.317 374.604 953.775 383.714L671.381 588.825C665.772 592.899 663.425 600.122 665.568 606.716L773.435 938.598C778.225 953.339 761.356 965.598 748.815 956.49L466.403 751.365C460.796 747.293 453.205 747.293 447.598 751.365L165.186 956.49C152.645 965.598 135.776 953.339 140.567 938.598L248.433 606.716C250.576 600.122 248.229 592.899 242.62 588.825L-39.7744 383.714C-52.316 374.604 -45.8723 354.768 -30.3716 354.768H318.697C325.628 354.768 331.771 350.305 333.913 343.714L441.784 11.8178Z"
               fill="#2ABAA5"
            />
         </svg>
      </SvgIcon>
   )
}

const DecorativeStar = (props: SvgIconProps) => {
   return (
      <SvgIcon id="decorative-star" viewBox="0 0 24 24" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
         >
            <path
               fillRule="evenodd"
               d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
               clipRule="evenodd"
            />
         </svg>
      </SvgIcon>
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

export default TempPage
