import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import Box from "@mui/material/Box"
import Image from "next/image"

const styles = sxStyles({
   root: {
      p: 0.5,
      background: "white",
      display: "flex",
   },
})

type Props = {
   src: string
   alt: string
   size?: number
   borderRadius?: number
}

const RoundedLogo: FC<Props> = ({ src, alt, size = 50, borderRadius = 4 }) => {
   const adjustedSize = size - 8 // 8 is the padding
   return (
      <Box borderRadius={borderRadius} sx={styles.root}>
         <Image
            src={src}
            width={adjustedSize}
            height={adjustedSize}
            objectFit={"contain"}
            alt={alt}
         />
      </Box>
   )
}

export default RoundedLogo
