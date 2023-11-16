import Box from "@mui/material/Box"
import { SxProps } from "@mui/system"
import { Theme } from "@mui/material/styles"
import Image from "next/legacy/image"
import { GraphCMSImageLoader } from "./util"
import { caseStudyCompanyCoverImageDimensions } from "./constants"
import React from "react"

const styles = {
   root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 5,
   },
}

interface Props {
   videoUrl?: string
   coverImageUrl: string
   sx?: SxProps<Theme>
   maxWidth?: number
}

const Video = ({ videoUrl, sx, maxWidth, coverImageUrl }: Props) => {
   return (
      <Box
         sx={[
            styles.root,
            {
               "& video": {
                  borderRadius: "inherit",
                  maxWidth,
               },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
      >
         {videoUrl ? (
            <video playsInline controls width="100%">
               <source src={videoUrl} type="video/mp4" />
            </video>
         ) : (
            <Image
               loader={GraphCMSImageLoader}
               objectFit={"contain"}
               width={caseStudyCompanyCoverImageDimensions.width}
               height={caseStudyCompanyCoverImageDimensions.height}
               src={coverImageUrl || ""}
            />
         )}
      </Box>
   )
}

export default Video
