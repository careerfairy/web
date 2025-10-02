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

interface TestimonialsSectionFMCGProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: string
   testimonials?: Testimonial[]
   sliderArrowColor?: IColors
}

const TestimonialsSectionFMCG: React.FC<TestimonialsSectionFMCGProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   testimonials,
   sliderArrowColor,
}) => {
   const title = "What FMCG Leaders Say About CareerFairy"
   const subtitle = "Discover how leading consumer goods companies are transforming their recruitment with our platform"

   // Filter testimonials for FMCG industry or use mock data
   const fmcgTestimonials = testimonials?.filter(testimonial => 
      testimonial.company?.industry?.includes("FMCG") ||
      testimonial.industry?.includes("FMCG") ||
      testimonial.company?.name?.toLowerCase().includes("unilever") ||
      testimonial.company?.name?.toLowerCase().includes("nestlé") ||
      testimonial.company?.name?.toLowerCase().includes("procter")
   ) || [
      {
         id: "fmcg-1",
         quote: "CareerFairy has revolutionized how we connect with top consumer goods talent. The quality of candidates we meet through their platform is exceptional.",
         author: "Sarah Johnson",
         title: "Global Talent Acquisition Director",
         company: {
            name: "Leading FMCG Company",
            logo: { url: "" }
         }
      },
      {
         id: "fmcg-2", 
         quote: "The live events format allows us to showcase our brand culture and connect with passionate professionals in the consumer goods space.",
         author: "Michael Chen",
         title: "Head of Recruitment",
         company: {
            name: "International Consumer Brand",
            logo: { url: "" }
         }
      }
   ]

   return (
      <Section
         big={big}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer maxWidth={fmcgTestimonials?.length ? "lg" : undefined}>
            <SectionHeader
               color={color}
               titleSx={styles.title}
               title={title}
               subtitle={subtitle}
            />
            <Grid
               container
               justifyContent="center"
               sx={styles.testimonialsWrapper}
            >
               <Grid item xs={12} md={12}>
                  <TestimonialCarousel
                     testimonials={fmcgTestimonials}
                     sliderArrowColor={sliderArrowColor}
                  />
               </Grid>
            </Grid>
         </SectionContainer>
      </Section>
   )
}

export default TestimonialsSectionFMCG