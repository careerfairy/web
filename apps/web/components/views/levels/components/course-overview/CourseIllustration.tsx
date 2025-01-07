import { Box } from "@mui/material"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      borderRadius: "8px",
      position: "relative",
      overflow: "hidden",
   },
   overlay: {
      position: "absolute",
      inset: 0,
      background: `linear-gradient(0deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 100%),
                  linear-gradient(180deg, rgba(0, 0, 0, 0.00) 50.32%, rgba(0, 0, 0, 0.60) 100%)`,
   },
   image: {
      objectFit: "cover",
   },
})

type Props = {
   isMobile: boolean
}

export const CourseIllustration = ({ isMobile }: Props) => {
   return (
      <Box
         width={isMobile ? "100%" : 360}
         height={isMobile ? 194 : 99}
         sx={styles.root}
      >
         <Image
            src={ILLUSTRATION_URL}
            alt="Quick start your career"
            style={styles.image}
            fill
            sizes={isMobile ? "100vw" : "360px"}
         />
         <Box sx={styles.overlay} />
      </Box>
   )
}

const ILLUSTRATION_URL =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/levels%2Fperson-with-laptop.jpg?alt=media&token=b9ed8f45-5ec8-4194-8dcc-7f40c3a55b7a"
