import { Stack, Typography } from "@mui/material"
import FramerBox, { FramerBoxProps } from "components/views/common/FramerBox"
import { Variants } from "framer-motion"
import Image from "next/image"
import { styles } from "./styles"

const CongratsMessage = () => {
   return (
      <Stack direction="column" alignItems="center" sx={styles.congratsRoot}>
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
            sx={styles.congratsTitle}
            variant="desktopBrandedH3"
            component="h3"
         >
            Congrats!
         </Typography>
         <Typography sx={styles.congratsText} variant="medium" component="p">
            You&apos;ve completed this module and are one step closer to your
            dream job!
         </Typography>
      </Stack>
   )
}

type Props = {
   isShorterScreen: boolean
   isShortScreen: boolean
}

export const CongratsSection = ({ isShorterScreen, isShortScreen }: Props) => {
   return (
      <FramerBox
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
         y: -100,
         transition: { duration: 0.5, ease: "easeOut" },
      },
   }
}
