import React from "react"
import Box, { BoxProps } from "@mui/material/Box"

type LinkedInShareProps = {
   url: string
} & BoxProps<"a">

const LinkedInShare: React.FC<LinkedInShareProps> = ({
   url,
   children,
   ...props
}) => {
   const encodedShareLink = encodeURIComponent(url)
   const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareLink}`

   return (
      <Box
         component="a"
         href={linkedInUrl}
         target="_blank"
         rel="noopener noreferrer"
         {...props}
      >
         {children}
      </Box>
   )
}

export default LinkedInShare
