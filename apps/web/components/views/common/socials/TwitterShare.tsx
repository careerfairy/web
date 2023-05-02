import React from "react"
import Box, { BoxProps } from "@mui/material/Box"

type WhatsAppShareProps = {
   title: string
   url: string
} & BoxProps<"a">

const TwitterShare: React.FC<WhatsAppShareProps> = ({
   title,
   url,
   children,
   ...props
}) => {
   const encodedTitle = encodeURIComponent(title)
   const encodedShareLink = encodeURIComponent(url)
   const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedShareLink}`

   return (
      <Box
         component="a"
         href={twitterUrl}
         target="_blank"
         rel="noopener noreferrer"
         {...props}
      >
         {children}
      </Box>
   )
}

export default TwitterShare
