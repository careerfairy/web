import { Stack, Typography } from "@mui/material"
import FramerBox, { FramerBoxProps } from "components/views/common/FramerBox"
import { Variants } from "framer-motion"
import dynamic from "next/dynamic"
import { congratsStyles } from "./styles"

const DotLottiePlayer = dynamic(
   () =>
      import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
   { ssr: false }
)

const ICON_SIZE = 220

const CongratsMessage = () => {
   return (
      <Stack
         direction="column"
         alignItems="center"
         sx={congratsStyles.congratsRoot}
      >
         <FramerBox {...iconAnimation}>
            <DotLottiePlayer
               src="https://lottie.host/d558d19f-a358-49da-94db-720735dfdd9f/8vHnDUfZon.lottie"
               autoplay
               loop={false}
               style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
               }}
            />
         </FramerBox>
         <Typography
            sx={congratsStyles.congratsTitle}
            variant="desktopBrandedH3"
            component="h3"
         >
            Congrats!
         </Typography>
         <Typography
            sx={congratsStyles.congratsText}
            variant="medium"
            component="p"
         >
            You&apos;ve completed this module and are one step closer to your
            dream job!
         </Typography>
      </Stack>
   )
}

type Props = {
   isShorterScreen: boolean
}

export const CongratsSection = ({ isShorterScreen }: Props) => {
   return (
      <FramerBox
         initial="initial"
         animate="animate"
         exit="exit"
         variants={getCongratsVariants(isShorterScreen)}
         transition={{ duration: 0.5, ease: "easeOut" }}
      >
         <CongratsMessage />
      </FramerBox>
   )
}

const iconAnimation: FramerBoxProps = {
   animate: {
      y: 0,
      scale: 1,
      transition: {
         type: "spring",
         bounce: 0.5,
         duration: 0.8,
      },
   },
   initial: {
      y: -50,
      scale: 0.8,
   },
}

const getCongratsVariants = (isShorterScreen: boolean): Variants => {
   return {
      initial: { opacity: 0, y: "-100%" },
      animate: {
         opacity: 1,
         y: 0,
         transform: isShorterScreen ? undefined : "translateY(-40%)",
         transition: {
            type: "spring",
            bounce: 0.3,
            duration: 0.8,
         },
      },
      exit: {
         opacity: 0,
         y: -100,
         transition: { duration: 0.5, ease: "easeOut" },
      },
   }
}
