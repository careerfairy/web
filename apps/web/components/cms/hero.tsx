import { Box, Button, Container, Typography } from "@mui/material"
import { HygraphHero } from "../../types/cmsTypes"
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
   subTitle: {
      mt: {
         xs: 3,
         md: 5,
      },
      width: "100%",
      mx: "auto",
      maxWidth: "80%",
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
   content: {
      bgColor: "grey.main",
      py: {
         lg: 24,
         xs: 10,
      },
   },
   main: {
      // py: { lg: 24 },
      // pt: 8,
      // pb: 10,
   },
   title: {
      fontWeight: 900,
   },
})

interface Props extends HygraphHero {
   pageTitle: string
   pageSubTitle: string
}

const Hero = ({ pageTitle, pageSubTitle, image, slug, buttons }: Props) => {
   return (
      <Box id={slug} sx={styles.root}>
         <Container
            disableGutters
            maxWidth={"xl"}
            sx={styles.main}
            component="main"
         >
            <Box sx={styles.content}>
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
                        variant="h1"
                        component="h1"
                        gutterBottom
                        fontWeight="extrabold"
                     >
                        {pageTitle}
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
            </Box>
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
         </Container>
      </Box>
   )
}
export default Hero
