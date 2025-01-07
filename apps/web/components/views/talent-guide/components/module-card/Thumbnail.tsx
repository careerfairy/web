import { Box } from "@mui/material"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      width: 97,
      borderRadius: "9px",
      overflow: "hidden",
      flexShrink: 0,
   },
})

type Props = {
   thumbnailUrl: string
}

export const Thumbnail = ({
   thumbnailUrl = "/levels/placeholder.jpeg",
}: Props) => {
   return (
      <Box id="levels-module-thumbnail" sx={styles.root}>
         <Image
            src={thumbnailUrl}
            alt="Levels Module Thumbnail"
            fill
            priority
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
         />
      </Box>
   )
}
