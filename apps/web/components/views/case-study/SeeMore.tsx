import React from "react"
import { CompanyCaseStudyPreview } from "../../../types/cmsTypes"
import Section from "./Section"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import CaseStudyCard from "./CaseStudyCard"
import Fade from "@stahl.luke/react-reveal/Fade"

interface Props {
   moreCompanyCaseStudies: CompanyCaseStudyPreview[]
}
const styles = {
   root: {
      backgroundColor: "background.default",
   },
   title: {
      fontWeight: 500,
      mb: 5,
   },
}
const SeeMore = ({ moreCompanyCaseStudies }: Props) => {
   return (
      <Section maxWidth={"lg"} sx={styles.root}>
         <Fade bottom>
            <Typography
               sx={styles.title}
               gutterBottom
               variant="h3"
               align="center"
            >
               Read more customer stories
            </Typography>
         </Fade>
         <Grid container spacing={2}>
            {moreCompanyCaseStudies.map((caseStudy) => (
               <Grid key={caseStudy.id} item xs={12} sm={6} md={4}>
                  <Fade left>
                     <CaseStudyCard caseStudyPreview={caseStudy} />
                  </Fade>
               </Grid>
            ))}
         </Grid>
      </Section>
   )
}

export default SeeMore
