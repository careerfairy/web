import { Stack, Typography } from "@mui/material"
import FramerBox, { FramerBoxProps } from "components/views/common/FramerBox"
import { Variants } from "framer-motion"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      textAlign: "center",
   },
   icon: {
      width: 152,
      height: 248,
      mb: 3.625,
   },
   title: {
      color: "neutral.800",
      fontWeight: 700,
   },
   text: {
      color: "neutral.700",
      maxWidth: 323,
   },
})

const CongratsMessage = () => {
   return (
      <Stack direction="column" alignItems="center" sx={styles.root}>
         <FramerBox {...iconAnimation}>
            <Image
               src="/talent-guide/medal.gif"
               alt="congrats"
               width={150}
               height={150}
               priority
               quality={100}
            />
         </FramerBox>
         <Typography
            sx={styles.title}
            variant="desktopBrandedH3"
            component="h3"
         >
            Congrats!
         </Typography>
         <Typography sx={styles.text} variant="medium" component="p">
            You&apos;ve completed this module and are one step closer to your
            dream job!
         </Typography>
      </Stack>
   )
}

type CongratsSectionProps = {
   isVisible: boolean
   isShorterScreen: boolean
   isShortScreen: boolean
}

export const CongratsSection = ({
   isVisible,
   isShorterScreen,
   isShortScreen,
}: CongratsSectionProps) => {
   if (!isVisible) return null

   return (
      <FramerBox
         key="congrats"
         initial="initial"
         animate="animate"
         exit="exit"
         variants={getCongratsVariants(isShorterScreen, isShortScreen)}
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

const getCongratsVariants = (
   isShorterScreen: boolean,
   isShortScreen: boolean
): Variants => {
   return {
      initial: { opacity: 0, y: 20 },
      animate: {
         opacity: 1,
         y: 0,
         transform: isShorterScreen
            ? undefined
            : isShortScreen
            ? "translateY(-50%)"
            : undefined,
      },
      exit: {
         opacity: 0,
         y: "-100%",
         transition: { duration: 0.5, ease: "easeOut" },
      },
   }
}
