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

interface TestimonialsSectionEngineeringProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: string
   testimonials?: Testimonial[]
   sliderArrowColor?: IColors
}

const TestimonialsSectionEngineering: React.FC<TestimonialsSectionEngineeringProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   testimonials,
   sliderArrowColor,
}) => {
   const title = "Engineering Leaders Choose CareerFairy"
   const subtitle = "See how top engineering and manufacturing companies are building exceptional teams through our platform"

   // Filter testimonials for Engineering/Manufacturing industry or use mock data
   const engineeringTestimonials = testimonials?.filter(testimonial => 
      testimonial.company?.industry?.includes("Engineering") ||
      testimonial.company?.industry?.includes("Manufacturing") ||
      testimonial.industry?.includes("Engineering") ||
      testimonial.industry?.includes("Manufacturing") ||
      testimonial.company?.name?.toLowerCase().includes("siemens") ||
      testimonial.company?.name?.toLowerCase().includes("boeing")
   ) || [
      {
         id: "eng-1",
         quote: "CareerFairy helps us identify and connect with skilled engineers who are passionate about innovation and technical excellence.",
         author: "David Rodriguez",
         title: "VP of Engineering Talent",
         company: {
            name: "Global Engineering Firm",
            logo: { url: "" }
         }
      },
      {
         id: "eng-2",
         quote: "The technical workshops and live sessions allow us to assess candidates' problem-solving skills in real-time. It's a game-changer for engineering recruitment.",
         author: "Lisa Wang",
         title: "Senior Technical Recruiter",
         company: {
            name: "Manufacturing Leader",
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
         <SectionContainer maxWidth={engineeringTestimonials?.length ? "lg" : undefined}>
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
                     testimonials={engineeringTestimonials}
                     sliderArrowColor={sliderArrowColor}
                  />
               </Grid>
            </Grid>
         </SectionContainer>
      </Section>
   )
}

export default TestimonialsSectionEngineering