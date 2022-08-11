import { Box, Button, Container, Typography } from "@mui/material"
import { HygraphResponseHero } from "../../types/cmsTypes"
import { sxStyles } from "../../types/commonTypes"
import Stack from "@mui/material/Stack"
import CmsImage from "./image"

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

interface Props extends HygraphResponseHero {
   pageTitle: string
   pageSubTitle: string
}

const Hero = ({ pageTitle, pageSubTitle, image, slug, buttons }: Props) => {
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
                     {pageTitle}
                  </Typography>
                  {pageSubTitle && (
                     <Typography
                        variant="h5"
                        sx={styles.subTitle}
                        color="text.secondary"
                        gutterBottom
                     >
                        {pageSubTitle}
                     </Typography>
                  )}
                  {buttons && (
                     <Stack
                        sx={styles.stack}
                        direction={{ xs: "column", md: "row" }}
                        justifyContent={{ sm: "center", lg: "flex-start" }}
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
                              />
                           </Box>
                        ))}
                     </Stack>
                  )}
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
export default Hero
