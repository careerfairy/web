import { Stack, Typography } from "@mui/material"
import FramerBox, { FramerBoxProps } from "components/views/common/FramerBox"
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

export const CongratsMessage = () => {
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
