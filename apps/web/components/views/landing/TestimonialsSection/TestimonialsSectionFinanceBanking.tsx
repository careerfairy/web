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

interface TestimonialsSectionFinanceBankingProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: string
   testimonials?: Testimonial[]
   sliderArrowColor?: IColors
}

const TestimonialsSectionFinanceBanking: React.FC<TestimonialsSectionFinanceBankingProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   testimonials,
   sliderArrowColor,
}) => {
   const title = "Trusted by Financial Services Leaders"
   const subtitle = "Discover how premier financial institutions are attracting top talent through our innovative recruitment platform"

   // Filter testimonials for Finance&Banking industry or use mock data
   const financeTestimonials = testimonials?.filter(testimonial => 
      testimonial.company?.industry?.includes("Finance&Banking") ||
      testimonial.company?.industry?.includes("Insurance") ||
      testimonial.industry?.includes("Finance") ||
      testimonial.industry?.includes("Banking") ||
      testimonial.company?.name?.toLowerCase().includes("goldman") ||
      testimonial.company?.name?.toLowerCase().includes("morgan")
   ) || [
      {
         id: "fin-1",
         quote: "CareerFairy has transformed our approach to recruiting finance professionals. We now connect with candidates who truly understand our industry's demands.",
         author: "James Thompson",
         title: "Global Head of Talent Acquisition",
         company: {
            name: "Leading Investment Bank",
            logo: { url: "" }
         }
      },
      {
         id: "fin-2",
         quote: "The quality of finance professionals we meet through CareerFairy's platform is outstanding. Their industry-specific approach really makes a difference.",
         author: "Emma Martinez",
         title: "Senior Recruitment Manager",
         company: {
            name: "International Financial Services",
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
         <SectionContainer maxWidth={financeTestimonials?.length ? "lg" : undefined}>
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
                     testimonials={financeTestimonials}
                     sliderArrowColor={sliderArrowColor}
                  />
               </Grid>
            </Grid>
         </SectionContainer>
      </Section>
   )
}

export default TestimonialsSectionFinanceBanking