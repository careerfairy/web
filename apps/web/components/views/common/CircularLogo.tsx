import { FC } from "react"
import { Avatar, type AvatarProps, Box } from "@mui/material"
import Image, { ImageProps } from "next/image"
import { sxStyles } from "types/commonTypes"

const getStyles = (size: number) =>
   sxStyles({
      root: {
         width: size,
         height: size,
         backgroundColor: "white",
         border: "solid 2px #F6F6FA",
         "& > *": {
            display: "flex",
         },
      },
   })

type Props = {
   src: string
   alt: string
   size?: number
   borderRadius?: number
   objectFit?: ImageProps["objectFit"]
   quality?: number
   children?: React.ReactNode
}

const CircularLogo: FC<Props> = ({
   src,
   alt,
   size = 50,
   borderRadius = 50,
   objectFit = "contain",
   quality = 70,
   children,
}) => {
   const adjustedSize = size - 8 // 8 is the padding
   const styles = getStyles(adjustedSize)

   return (
      <Avatar variant="circular" sx={styles.root}>
         <Box borderRadius={borderRadius}>
            <Image
               src={src}
               width={adjustedSize}
               height={adjustedSize}
               objectFit={objectFit}
               alt={alt}
               quality={quality}
            />
         </Box>
         {children}
      </Avatar>
   )
}

export default CircularLogo
