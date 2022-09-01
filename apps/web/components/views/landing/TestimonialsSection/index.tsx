import React from "react"
import Section from "components/views/common/Section"
import { Grid } from "@mui/material"
import SectionHeader from "components/views/common/SectionHeader"
import SectionContainer from "../../common/Section/Container"
import TestimonialCarousel from "./TestimonialCarousel"
import { IColors, sxStyles } from "../../../../types/commonTypes"
import { Testimonial } from "../../../../types/cmsTypes"

const styles = sxStyles({
   testimonialsWrapper: {
      display: "flex",
      width: "100%",
   },
   title: {
      fontWeight: 500,
   },
})

const TestimonialsSection = ({
   big,
   color,
   backgroundImageClassName,
   backgroundImage,
   backgroundImageOpacity,
   backgroundColor,
   title,
   subtitle,
   testimonials,
   sliderArrowColor,
}: Props) => {
   return (
      <Section
         big={big}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer maxWidth={testimonials?.length ? "lg" : undefined}>
            {title && (
               <SectionHeader
                  color={color}
                  titleSx={styles.title}
                  title={title}
                  subtitle={subtitle}
               />
            )}
            <Grid
               container
               justifyContent="center"
               sx={styles.testimonialsWrapper}
            >
               <Grid item xs={12} md={12}>
                  <TestimonialCarousel
                     testimonials={testimonials}
                     sliderArrowColor={sliderArrowColor}
                  />
               </Grid>
            </Grid>
         </SectionContainer>
      </Section>
   )
}

export default TestimonialsSection

type Props = {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: string
   subtitle?: string
   title?: string
   testimonials?: Testimonial[]
   sliderArrowColor?: IColors
}
