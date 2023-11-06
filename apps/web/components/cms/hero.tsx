import { Box, Button, Container, Typography } from "@mui/material"
import { HygraphResponseHero } from "../../types/cmsTypes"
import { sxStyles } from "../../types/commonTypes"
import Stack from "@mui/material/Stack"
import CmsImage from "./image"
import React, { FC, useMemo } from "react"
import LaptopVideo from "components/views/landing/HeroSection/LaptopVideo"
import { PillsBackground } from "../../materialUI/GlobalBackground/GlobalBackGround"
import { MainLogo } from "../logos"

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
   fullScreenImageWrapper: {
      width: "100% !important",
      position: "absolute !important",
      inset: 0,
      height: "100% !important",
   },
   videoWrapper: {
      display: {
         xs: "none",
         lg: "flex",
      },
      alignItems: {
         lg: "center",
      },
      "& .laptop-video": {
         width: "auto",
      },
      width: "50%",
      position: {
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
      py: {
         lg: 24,
         xs: 10,
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
   subTitle: {
      textAlign: {
         xs: "center",
         lg: "left",
      },
   },
   stack: {
      mt: 5,
      width: {
         xs: "100%",
         lg: "auto",
      },
   },
   root: {
      position: "relative",
   },
   container: {
      zIndex: 1,
      bgColor: "grey.main",
      pt: {
         lg: 20,
         xs: 10,
      },
      pb: {
         lg: 10,
         xs: 5,
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
   whiteText: {
      color: "white",
      textShadow: (theme) => theme.darkTextShadow,
   },
   fullScreenMain: {
      height: "100%",
      zIndex: 1,
   },
   fullScreenVideoWrapper: {
      position: "absolute",
      width: "100%",
      height: "100%",
   },
   fullScreenVideo: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
   },
   logo: {
      width: { xs: 150, lg: 300 },
      position: "absolute",
      top: { xs: "3vw", md: "3vw" },
   },
   defaultMain: {
      display: "flex",
      alignItems: {
         md: "center",
      },
   },
})

const Hero: FC<
   HygraphResponseHero & {
      children?: React.ReactNode
   }
> = ({
   image,
   video,
   slug,
   buttons,
   heroTitle,
   heroSubtitle,
   fullScreenImage,
   children,
}) => {
   const titleText = heroTitle
   const subtitleText = heroSubtitle

   const renderImage = useMemo(
      () => (
         <Box
            sx={[
               styles.imageWrapper,
               fullScreenImage && styles.fullScreenImageWrapper,
            ]}
         >
            <CmsImage
               cmsImage={image}
               imageProps={{
                  layout: "fill",
                  priority: true,
                  objectFit: "cover",
               }}
            />
         </Box>
      ),
      [fullScreenImage, image]
   )

   const renderVideo = useMemo(
      () =>
         fullScreenImage ? (
            <Box sx={styles.fullScreenVideoWrapper}>
               <Box
                  component="video"
                  sx={styles.fullScreenVideo}
                  autoPlay
                  loop
                  muted
                  src={video?.url}
                  playsInline
               />
            </Box>
         ) : (
            <Box sx={styles.videoWrapper}>
               <LaptopVideo videoUrl={video?.url} />
            </Box>
         ),
      [fullScreenImage, video?.url]
   )

   return (
      <Box paddingBottom={6}>
         <PillsBackground minHeight={"fit-content"}>
            <Box id={slug} sx={styles.root}>
               <Box
                  sx={[
                     styles.defaultMain,
                     fullScreenImage && styles.fullScreenMain,
                  ]}
                  component="main"
               >
                  <Container maxWidth={"xl"} sx={styles.container}>
                     <Box px={[4, 8]} pr={{ xl: 16 }} width={{ lg: "50%" }}>
                        <MainLogo sx={styles.logo} />

                        <Typography
                           variant="h1"
                           component="h1"
                           gutterBottom
                           sx={[
                              styles.title,
                              fullScreenImage && styles.whiteText,
                           ]}
                        >
                           {titleText}
                        </Typography>
                        {subtitleText && (
                           <Typography
                              variant="h5"
                              sx={[
                                 styles.subTitle,
                                 fullScreenImage && styles.whiteText,
                              ]}
                              color="text.secondary"
                              gutterBottom
                           >
                              {subtitleText}
                           </Typography>
                        )}
                        {buttons && (
                           <Stack
                              sx={styles.stack}
                              direction={{ xs: "column", md: "row" }}
                              justifyContent={{
                                 sm: "center",
                                 lg: "flex-start",
                              }}
                              spacing={{
                                 lg: 3,
                                 xs: 1,
                              }}
                           >
                              {buttons.map((button) => (
                                 <Box key={button.slug}>
                                    <Button
                                       fullWidth
                                       sx={{
                                          ":nth-of-type(even)": {
                                             mx: {
                                                xs: 0,
                                                md: 3,
                                             },
                                          },
                                       }}
                                       {...button}
                                       size={button.size || "medium"}
                                    />
                                 </Box>
                              ))}
                           </Stack>
                        )}
                        {children}
                     </Box>
                  </Container>
                  {image && !video && renderImage}
                  {video && video?.url && renderVideo}
               </Box>
            </Box>
         </PillsBackground>
      </Box>
   )
}

export default Hero
