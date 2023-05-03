import React from "react"
import Box, { BoxProps } from "@mui/material/Box"

type WhatsAppShareProps = {
   title: string
   url: string
} & BoxProps<"a">

const WhatsAppShare: React.FC<WhatsAppShareProps> = ({
   title,
   url,
   children,
   ...props
}) => {
   const encodedTitle = encodeURIComponent(title)
   const encodedShareLink = encodeURIComponent(url)
   const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedShareLink}`

   return (
      <Box
         component="a"
         href={whatsappUrl}
         target="_blank"
         rel="noopener noreferrer"
         {...props}
      >
         {children}
      </Box>
   )
}

export default WhatsAppShare
