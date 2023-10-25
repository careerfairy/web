import React from "react"
import { Avatar, type AvatarProps, Box } from "@mui/material"
import Image, { ImageProps } from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
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
   sx?: AvatarProps["sx"]
}

const CircularLogo = React.forwardRef<HTMLDivElement, Props>(
   (
      {
         src,
         alt,
         size = 50,
         borderRadius = 50,
         objectFit = "contain",
         quality = 70,
         children,
         sx,
      },
      ref
   ) => {
      return (
         <Avatar
            variant="circular"
            sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
            ref={ref}
         >
            <Box borderRadius={borderRadius}>
               <Image
                  src={src}
                  width={size}
                  height={size}
                  objectFit={objectFit}
                  alt={alt}
                  quality={quality}
               />
            </Box>
            {children}
         </Avatar>
      )
   }
)

CircularLogo.displayName = "CircularLogo"

export default CircularLogo
