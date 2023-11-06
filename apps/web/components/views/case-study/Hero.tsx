import React from "react"
import Section from "./Section"
import Typography from "@mui/material/Typography"
import { ICmsImage, Company } from "../../../types/cmsTypes"
import Image from "next/legacy/image"
import { GraphCMSImageLoader } from "../../cms/util"
import Grid from "@mui/material/Grid"
import Fade from "@stahl.luke/react-reveal/Fade"
import { caseStudyCompanyLogoDimensions } from "../../cms/constants"
import Video from "../../cms/Video"

const gridSpacing = 3
const maxVideoWidth = 600
const styles = {
   root: {
      background: "black",
      px: { xs: 0.2, sm: gridSpacing },
      color: "white",
      pt: {
         xs: 12,
         md: 15,
      },
      pb: {
         xs: 8,
         md: 15,
      },
   },
   title: {
      fontWeight: 600,
      maxWidth: maxVideoWidth,
   },
   itemsStack: {
      width: "100%",
   },
   detailsWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: {
         xs: "flex-start",
         sm: "center",
         md: "flex-start",
      },
      "& img": {
         filter: "grayscale(100%) brightness(200%)",
      },
   },
   coverMediaWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: { xs: "center", md: "flex-end" },
      "& img": {
         borderRadius: 5,
      },
   },
}
const Hero = ({ company, coverVideoUrl, coverImage, title }: Props) => {
   return (
      <Section maxWidth={"lg"} sx={styles.root}>
         <Grid container spacing={gridSpacing}>
            <Grid item xs={12} md={5} sx={styles.detailsWrapper}>
               <Fade bottom>
                  <Image
                     loader={GraphCMSImageLoader}
                     width={caseStudyCompanyLogoDimensions.width}
                     objectFit={"contain"}
                     height={caseStudyCompanyLogoDimensions.height}
                     src={company?.logo?.url}
                     alt={company?.name}
                  />
                  <Typography sx={styles.title} component="h1" variant="h3">
                     {title}
                  </Typography>
               </Fade>
            </Grid>
            <Grid item xs={12} md={7} sx={styles.coverMediaWrapper}>
               <Fade bottom>
                  <Video
                     maxWidth={maxVideoWidth}
                     coverImageUrl={coverImage?.url}
                     videoUrl={coverVideoUrl}
                  />
               </Fade>
            </Grid>
         </Grid>
      </Section>
   )
}
interface Props {
   title: string
   coverImage: ICmsImage
   coverVideoUrl: string
   company: Company
}
export default Hero
