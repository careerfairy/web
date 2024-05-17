import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Container } from "@mui/material"
import Image from "next/legacy/image"
import { ReactNode } from "react"
import BackAndCloseButton from "./BackAndCloseButton"
import StaticSkeleton from "./StaticSkeleton"

const styles = sxStyles({
   heroContent: {
      color: "white",
      justifyContent: "center",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      pt: 6,
      pb: 2.25,
      px: 2.25,
      borderRadius: 3,
      overflow: "hidden",
      "& #background-image": {
         zIndex: -1,
      },
      minHeight: {
         xs: 439,
         md: 0,
      },
   },
   heroContentContainer: {
      zIndex: 1,
   },
   backgroundImgOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "black",
      opacity: 0.65,
      zIndex: 0,
   },
   backgroundImgOverlaySkeleton: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
   },
})

type HeroContentProps = {
   backgroundImage: string
   children: ReactNode
   handleCloseDialog?: () => void
}

const HeroContent = ({
   backgroundImage,
   handleCloseDialog,
   children,
}: HeroContentProps) => {
   return (
      <Box sx={styles.heroContent}>
         <Container
            disableGutters
            sx={styles.heroContentContainer}
            maxWidth={"md"}
         >
            {children}
         </Container>
         {backgroundImage ? (
            <>
               <Image
                  alt={"background image"}
                  src={backgroundImage}
                  layout={"fill"}
                  objectFit={"cover"}
               />
               <Box sx={styles.backgroundImgOverlay} />
            </>
         ) : (
            <StaticSkeleton
               variant="rounded"
               sx={styles.backgroundImgOverlaySkeleton}
            />
         )}
         <BackAndCloseButton handleCloseDialog={handleCloseDialog} />
      </Box>
   )
}

export default HeroContent
