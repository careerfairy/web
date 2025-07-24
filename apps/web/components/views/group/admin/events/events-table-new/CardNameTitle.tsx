import { Box, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      gap: 1,
      minWidth: 300,
   },
   thumbnailImage: {
      borderRadius: "4px",
      objectFit: "cover",
      backgroundColor: "neutral.200",
      flexShrink: 0,
   },
   contentContainer: {
      flex: 1,
      minWidth: 0,
   },
   titleText: {
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 400,
      color: "neutral.800",
      ...getMaxLineStyles(2),
   },
})

type Props = {
   title?: string
   backgroundImageUrl?: string
}

export const CardNameTitle = ({ title, backgroundImageUrl }: Props) => {
   return (
      <Box sx={styles.container}>
         <Image
            src={backgroundImageUrl || placeholderBanner}
            alt={title || "Livestream thumbnail"}
            width={116}
            height={64}
            style={styles.thumbnailImage}
            quality={100}
         />
         <Box sx={styles.contentContainer}>
            <Typography sx={styles.titleText}>{title || "Untitled"}</Typography>
         </Box>
      </Box>
   )
}
