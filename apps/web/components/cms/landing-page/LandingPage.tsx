import { Box, Container, Typography } from "@mui/material"
import CmsImage from "../image"
import {
   HygraphRemoteFieldOfStudyResponse,
   ICmsImage,
} from "../../../types/cmsTypes"
import { sxStyles } from "../../../types/commonTypes"
import React from "react"

type Props = {
   slug: string
   title: string
   subTitle: string
   image: ICmsImage
   fieldsOfStudy: HygraphRemoteFieldOfStudyResponse[]
}

const styles = sxStyles({
   imageWrapper: {
      height: (theme) => ({
         xs: theme.spacing(32),
         sm: theme.spacing(36),
         md: theme.spacing(48),
         lg: "100%",
      }),
      width: {
         xs: "100%",
         lg: "50%",
      },
      position: {
         xs: "relative",
         lg: "absolute",
      },
      top: {
         lg: 0,
      },
      bottom: {
         lg: 0,
      },
      right: {
         lg: 0,
      },
   },
   detailsWrapper: {
      mx: "auto",
      maxWidth: "80%",
      width: "100%",
      py: {
         lg: 4,
      },
      pt: 2,
      pb: 3,
   },
   subTitle: {},
   root: {
      position: "relative",
   },
   container: {
      bgColor: "grey.main",
      py: {
         lg: 24,
         xs: 10,
      },
      pl: 0,
      pr: 0,
   },
   title: {
      fontWeight: 900,
      textAlign: {
         xs: "center",
         lg: "left",
      },
   },
})

const LandingPage = ({
   slug,
   title,
   subTitle,
   image,
   fieldsOfStudy,
}: Props) => {
   console.log("-> fieldsOfStudy", fieldsOfStudy)

   return (
      <Box id={slug} sx={styles.root}>
         <Box component="main">
            <Container maxWidth={"xl"} sx={styles.container}>
               <Box px={[4, 8]} pr={{ xl: 16 }} width={{ lg: "50%" }}>
                  <Typography
                     variant="h1"
                     component="h1"
                     gutterBottom
                     sx={styles.title}
                  >
                     {title}
                  </Typography>
                  {subTitle && (
                     <Typography
                        variant="h5"
                        sx={styles.subTitle}
                        color="text.secondary"
                        gutterBottom
                     >
                        {subTitle}
                     </Typography>
                  )}
                  {/* TODO: Show Field of Study Input */}
               </Box>
            </Container>
            {image && (
               <Box sx={styles.imageWrapper}>
                  <CmsImage
                     cmsImage={image}
                     imageProps={{
                        layout: "fill",
                        priority: true,
                        objectFit: "cover",
                     }}
                  />
               </Box>
            )}
         </Box>
      </Box>
   )
}

export default LandingPage
