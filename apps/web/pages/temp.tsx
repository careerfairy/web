import { Button, Grow, SvgIcon, SvgIconProps } from "@mui/material"
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

const ANIMATION_SLOWNESS = 10
const PAUSE_MID_ANIMATION = true

type RotatingDecorativeStarProps = {
   x: number | string
   y: number | string
   color?: string
   size?: number
}

const RotatingDecorativeStar = ({
   x,
   y,
   color,
   size,
}: RotatingDecorativeStarProps) => (
   <FramerBox
      animate={{
         x: 0,
         y: 0,
         rotate: 360,
      }}
      transition={{
         duration: 0.7,
         rotate: {
            duration: 6,
            repeat: Infinity,
            ease: "linear",
         },
      }}
      sx={{
         position: "absolute",
         top: y,
         left: x,
      }}
   >
      <DecorativeStar sx={{ color }} width={size} height={size} />
   </FramerBox>
)

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
               }, 3000)
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
               }),
            }}
         >
            <AnimatePresence mode="wait">
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
                                 ? 0.3 * ANIMATION_SLOWNESS
                                 : 0.8,
                           ease:
                              animationPhase === AnimationPhase.FIRST_PHASE
                                 ? "easeOut"
                                 : "easeInOut",
                           type: "tween", // Added for consistent motion
                        },
                        opacity: { duration: 0.3 }, // Added for smoother fade
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
                        zIndex: 1,
                     }}
                  >
                     {/* Main star at the top of container */}
                     <Box
                        sx={{
                           position: "absolute",
                           top: isMobile ? -150 : -350,
                           left: "50%",
                           transform: "translateX(-50%)",
                           width: "100%",
                           height: "auto",
                           zIndex: 1,
                        }}
                     >
                        <MainStar sx={{ width: "100%", height: "auto" }} />
                     </Box>

                     {/* Decorative star 1 */}
                     <RotatingDecorativeStar x="45%" y="50%" color="#1FB6A0" />

                     {/* Decorative star 2 */}
                     <RotatingDecorativeStar x="50%" y="50%" color="#1FA692" />

                     {/* Decorative star 3 */}
                     <RotatingDecorativeStar x="55%" y="50%" color="#3EB9A7" />

                     {/* Text */}
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

                     {/* Light effect */}
                     <FramerBox
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
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
            </AnimatePresence>

            {/* Container label */}
            {animationPhase === AnimationPhase.NOT_STARTED && !isAnimating && (
               <Typography variant="body2" color="text.secondary">
                  Animation Container
               </Typography>
            )}
         </Box>

         {/* Controls */}
         <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Grow in={!isAnimating}>
               <Button onClick={startAnimation} variant="contained">
                  Show Success Animation
               </Button>
            </Grow>
         </Box>
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
      <SvgIcon id="decorative-star" viewBox="0 0 215 197" {...props}>
         <svg
            width="28"
            height="28"
            viewBox="0 0 215 197"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M214.578 119.94C214.578 119.94 214.577 119.94 214.577 119.939L158.894 72.6C155.847 70.0098 154.289 66.073 154.738 62.0993L160.245 13.3897C161.39 3.26239 150.196 -3.59908 141.691 2.01668L100.784 29.0271C97.4468 31.2306 93.2318 31.6288 89.541 30.0891L43.9355 11.0641C34.8607 7.27846 25.3302 15.4046 27.6337 24.9637L39.2968 73.3628C40.2215 77.2002 39.2019 81.2469 36.5693 84.188L3.08201 121.599C-3.71125 129.188 1.43113 141.256 11.6103 141.614L63.339 143.43C67.751 143.585 71.7224 146.148 73.6815 150.104L93.5968 190.319C98.1588 199.531 111.432 199.129 115.428 189.658L134.655 144.087C136.141 140.565 139.214 137.961 142.931 137.073L214.575 119.956C214.583 119.954 214.584 119.944 214.578 119.94Z"
               fill="currentColor"
            />
         </svg>
      </SvgIcon>
   )
}

export default TempPage
