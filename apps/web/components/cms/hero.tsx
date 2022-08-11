import Image from "next/image"

import { Box, Button, Typography } from "@mui/material"
import { Hero } from "../../types/cmsTypes"
import { sxStyles } from "../../types/commonTypes"
import Stack from "@mui/material/Stack"

const styles = sxStyles({
   imageWrapper: {
      height: {
         xs: 64,
         sm: 72,
         md: 96,
         lg: "100vh",
      },
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
      mt: 10,
   },
   root: {
      position: "relative",
   },
})

interface Props extends Hero {
   pageTitle: string
   pageSubTitle: string
}

const Hero = ({ buttons, image, pageTitle, pageSubTitle }: Props) => (
   <Box sx={styles.root} bg="gray.50">
      <Box component="main" position={{ lg: "relative" }}>
         <Box sx={styles.root}>
            <Box px={[4, 8]} pr={{ xl: 16 }} width={{ lg: "50%" }}>
               <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  fontWeight="extrabold"
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
                     direction={["column", "row"]}
                     display={{ sm: "flex" }}
                     justifyContent={{ sm: "center", lg: "flex-start" }}
                     spacing={[3, 0]}
                  >
                     {buttons.map((button) => (
                        <Box
                           key={button.slug}
                           sx={{
                              ":nth-of-type(even)": {
                                 mx: [0, 3],
                              },
                           }}
                        >
                           <Button {...button} />
                        </Box>
                     ))}
                  </Stack>
               )}
            </Box>
         </Box>
         <Box sx={styles.imageWrapper}>
            <Image
               className="hero-image"
               src={image.url}
               alt={image.alt}
               title={image.caption}
               layout="fill"
               priority={true}
               objectFit="cover"
            />
         </Box>
      </Box>
   </Box>
)
export default Hero
