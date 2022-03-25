import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import { Grid } from "@mui/material"
import SectionHeader from "components/views/common/SectionHeader"
import SectionContainer from "../../common/Section/Container"
import TestimonialCarousel from "./TestimonialCarousel"

const styles = {
   testimonialsWrapper: {
      display: "flex",
      width: "100%",
   },
   title: {
      fontWeight: 500,
   },
}

const TestimonialsSection = (props) => {
   return (
      <Section
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            <SectionHeader
               color={props.color}
               titleSx={styles.title}
               title={props.title}
               subtitle={props.subtitle}
            />
            <Grid
               container
               justifyContent="center"
               sx={styles.testimonialsWrapper}
            >
               <Grid item xs={12} md={12}>
                  <TestimonialCarousel />
               </Grid>
            </Grid>
         </SectionContainer>
      </Section>
   )
}

export default TestimonialsSection

TestimonialsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
