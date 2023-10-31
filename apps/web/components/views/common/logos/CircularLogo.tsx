import React, { useState } from "react"
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
      const styles = getStyles(size)

      const [noLoadErrorOccurred, setNoLoadErrorOccurred] = useState(true)

      return (
         <Avatar
            variant="circular"
            sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
            ref={ref}
         >
            <Box borderRadius={borderRadius}>
               {noLoadErrorOccurred ? (
                  <Image
                     src={src}
                     width={size}
                     height={size}
                     objectFit={objectFit}
                     alt={alt}
                     quality={quality}
                     onError={() => setNoLoadErrorOccurred(false)}
                  />
               ) : (
                  <Box
                     component="img"
                     src={src}
                     alt={alt}
                     width={size}
                     height={size}
                     style={{
                        objectFit: objectFit,
                     }}
                  />
               )}
            </Box>
            {children}
         </Avatar>
      )
   }
)

CircularLogo.displayName = "CircularLogo"

export default CircularLogo
