import { Testimonial } from "../../../types/cmsTypes"
import Box from "@mui/material/Box"
import TestimonialsSection from "components/views/landing/TestimonialsSection"
import { IColors } from "../../../types/commonTypes"

type Props = {
   testimonials: Testimonial[]
   sliderArrowColor: IColors
}

const TestimonialList = ({
   testimonials,
   sliderArrowColor,
}: Props): JSX.Element => {
   return (
      <Box paddingX={2}>
         <TestimonialsSection
            testimonials={testimonials}
            sliderArrowColor={sliderArrowColor}
         />
      </Box>
   )
}

export default TestimonialList
