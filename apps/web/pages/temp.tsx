import { Button } from "@mui/material"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { AnimatePresence } from "framer-motion"
import { NextPage } from "next"
import { useEffect, useState } from "react"
import FramerBox from "../components/views/common/FramerBox"

const TempPage: NextPage = () => {
   const [animationPhase, setAnimationPhase] = useState(0) // 0: not started, 1: first phase, 2: second phase
   const [isAnimating, setIsAnimating] = useState(false)

   // Control the animation flow
   useEffect(() => {
      let timer: NodeJS.Timeout

      if (animationPhase === 1) {
         // After the card is visible and animation has played, transition to phase 2
         timer = setTimeout(() => {
            setAnimationPhase(2)
         }, 3000)
      } else if (animationPhase === 2) {
         // After the exit animation is done, reset everything
         timer = setTimeout(() => {
            setAnimationPhase(0)
            setIsAnimating(false)
         }, 800) // Match the exit animation duration
      }

      return () => {
         if (timer) clearTimeout(timer)
      }
   }, [animationPhase])

   const startAnimation = () => {
      setIsAnimating(true)
      setAnimationPhase(1)
   }

   const resetAnimation = () => {
      setAnimationPhase(0)
      setIsAnimating(false)
   }

   return (
      <div
         style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
         }}
      >
         {/* Container with visible borders */}
         <Box
            sx={{
               width: { xs: 320, md: 420 },
               height: { xs: 320, md: 420 },
               border: "2px dashed #ccc",
               borderRadius: "8px",
               position: "relative",
               overflow: "hidden", // Important to clip content
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               backgroundColor: "#f5f5f5",
            }}
         >
            <AnimatePresence
               mode="wait"
               onExitComplete={() => console.log("Animation exit complete")}
            >
               {animationPhase > 0 && (
                  <FramerBox
                     key="success-container"
                     initial={{
                        opacity: 1,
                        y: "100%", // Start from below the container
                     }}
                     animate={{
                        opacity: 1,
                        y: animationPhase === 1 ? 0 : "-100%", // Phase 1: center, Phase 2: exit up
                     }}
                     exit={{
                        opacity: 0,
                        y: "-100%",
                     }}
                     transition={{
                        y: {
                           duration: animationPhase === 1 ? 0.5 : 0.8,
                           ease: animationPhase === 1 ? "easeOut" : "easeInOut",
                        },
                     }}
                     sx={{
                        position: "absolute",
                        width: { xs: 280, md: 380 },
                        height: { xs: 280, md: 380 },
                        borderRadius: "5px",
                        overflow: "hidden",
                        background:
                           "linear-gradient(to bottom, #46C3B0, #ADE3DB)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                     }}
                  >
                     {/* Main star */}
                     <FramerBox
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2 }}
                        transition={{
                           duration: 0.5,
                           ease: "easeOut",
                           delay: 0.5,
                        }}
                        sx={{
                           position: "absolute",
                           width: 80,
                           height: 80,
                           display: "flex",
                           justifyContent: "center",
                           alignItems: "center",
                        }}
                     >
                        <svg
                           width="60"
                           height="60"
                           viewBox="0 0 2014 1918"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              d="M976.561 22.113C986.145 -7.3701 1027.86 -7.37005 1037.44 22.1131L1253.22 685.965C1257.51 699.15 1269.8 708.077 1283.66 708.077H1981.93C2012.94 708.077 2025.83 747.76 2000.74 765.981L1435.85 1176.23C1424.63 1184.38 1419.93 1198.83 1424.22 1212.02L1639.99 1875.84C1649.58 1905.32 1615.83 1929.85 1590.75 1911.63L1025.81 1501.34C1014.59 1493.2 999.408 1493.2 988.192 1501.34L423.253 1911.63C398.166 1929.85 364.421 1905.32 374.006 1875.84L589.78 1212.02C594.067 1198.83 589.371 1184.38 578.149 1176.23L13.2593 765.981C-11.8307 747.76 1.05859 708.077 32.0672 708.077H730.337C744.201 708.077 756.49 699.15 760.776 685.965L976.561 22.113Z"
                              fill="#2ABAA5"
                           />
                        </svg>
                     </FramerBox>

                     {/* Decorative star 1 */}
                     <FramerBox
                        initial={{ opacity: 0, x: -50, y: -30 }}
                        animate={{ opacity: 0.3, x: 0, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.7 }}
                        sx={{
                           position: "absolute",
                           top: "30%",
                           left: "25%",
                        }}
                     >
                        <svg
                           width="30"
                           height="30"
                           viewBox="0 0 459 444"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              d="M458.819 324.029C458.818 324.028 458.818 324.028 458.817 324.027L365.23 194.418C362.89 191.177 362.316 186.984 363.7 183.233L411.317 54.1509C414.842 44.5928 405.612 35.2633 396.017 38.6872L266.434 84.9261C262.669 86.2695 258.483 85.6511 255.267 83.2766L145.697 2.3689C137.79 -3.46958 126.601 2.14668 126.558 11.9754L125.961 148.85C125.944 152.796 123.99 156.481 120.733 158.708L5.23289 237.701C-3.171 243.449 -1.05635 256.39 8.73988 259.164L147.405 298.426C151.651 299.629 154.896 303.063 155.854 307.371L184.169 434.594C186.401 444.624 199.382 447.398 205.519 439.157L288.383 327.882C290.665 324.818 294.269 323.023 298.089 323.047L458.806 324.059C458.822 324.06 458.83 324.04 458.819 324.029Z"
                              fill="#1FA692"
                           />
                        </svg>
                     </FramerBox>

                     {/* Decorative star 2 */}
                     <FramerBox
                        initial={{ opacity: 0, x: 50, y: -20 }}
                        animate={{ opacity: 0.2, x: 0, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.7 }}
                        sx={{
                           position: "absolute",
                           top: "25%",
                           right: "25%",
                        }}
                     >
                        <svg
                           width="25"
                           height="25"
                           viewBox="0 0 354 379"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              d="M218.831 0.00590551C218.83 0.00653743 218.83 0.00710974 218.829 0.00765631L130.21 94.9027C127.48 97.8261 123.474 99.199 119.525 98.5649L13.9484 81.6132C3.88334 79.9972 -3.49403 90.8614 1.72031 99.6208L56.4158 191.502C58.4618 194.939 58.6631 199.169 56.9527 202.785L11.5565 298.753C7.35099 307.643 15.0257 317.545 24.6839 315.689L129.497 295.548C133.374 294.803 137.37 296.011 140.186 298.778L217.834 375.094C225.1 382.235 237.398 377.66 238.229 367.507L247.384 255.732C247.745 251.331 250.49 247.483 254.534 245.71L346.809 205.254C356.226 201.126 356.443 187.846 347.166 183.412L249.874 136.906C246.425 135.257 243.966 132.066 243.252 128.311L218.857 0.0113503C218.855 -0.00138191 218.838 -0.00483705 218.831 0.00590551Z"
                              fill="#1FB6A0"
                           />
                        </svg>
                     </FramerBox>

                     {/* Decorative star 3 */}
                     <FramerBox
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 0.3, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.7 }}
                        sx={{
                           position: "absolute",
                           bottom: "30%",
                           right: "35%",
                        }}
                     >
                        <svg
                           width="28"
                           height="28"
                           viewBox="0 0 215 197"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              d="M214.578 119.94C214.578 119.94 214.577 119.94 214.577 119.939L158.894 72.6C155.847 70.0098 154.289 66.073 154.738 62.0993L160.245 13.3897C161.39 3.26239 150.196 -3.59908 141.691 2.01668L100.784 29.0271C97.4468 31.2306 93.2318 31.6288 89.541 30.0891L43.9355 11.0641C34.8607 7.27846 25.3302 15.4046 27.6337 24.9637L39.2968 73.3628C40.2215 77.2002 39.2019 81.2469 36.5693 84.188L3.08201 121.599C-3.71125 129.188 1.43113 141.256 11.6103 141.614L63.339 143.43C67.751 143.585 71.7224 146.148 73.6815 150.104L93.5968 190.319C98.1588 199.531 111.432 199.129 115.428 189.658L134.655 144.087C136.141 140.565 139.214 137.961 142.931 137.073L214.575 119.956C214.583 119.954 214.584 119.944 214.578 119.94Z"
                              fill="#3EB9A7"
                           />
                        </svg>
                     </FramerBox>

                     {/* Text */}
                     <FramerBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        sx={{ marginTop: 20, textAlign: "center" }}
                     >
                        <Typography
                           variant="h4"
                           sx={{
                              fontWeight: 900,
                              color: "#FFFFFF",
                              textTransform: "uppercase",
                              fontSize: { xs: "1.8rem", md: "2.5rem" },
                              lineHeight: "1em",
                           }}
                        >
                           Registration
                           <br />
                           successful
                        </Typography>
                     </FramerBox>

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
            {animationPhase === 0 && !isAnimating && (
               <Typography variant="body2" color="text.secondary">
                  Animation Container
               </Typography>
            )}
         </Box>

         {/* Controls */}
         <Box sx={{ mt: 2 }}>
            {!isAnimating ? (
               <Button onClick={startAnimation} variant="contained">
                  Show Success Animation
               </Button>
            ) : (
               <Button onClick={resetAnimation} variant="contained">
                  Reset Animation
               </Button>
            )}
         </Box>

         {/* Description */}
         <Box sx={{ mt: 1, p: 2, maxWidth: "500px", textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
               Phase 1: Animation slides up into container and plays
               <br />
               Phase 2: Animation slides up and out of container
            </Typography>
         </Box>
      </div>
   )
}

export default TempPage
