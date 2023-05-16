import { forwardRef } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const AboutCompany = forwardRef<HTMLDivElement, Props>(function AboutCompany(
   { children },
   ref
) {
   return (
      <Box ref={ref}>
         <SectionTitle>Connect with Our Brand</SectionTitle>
         <DummyContent />
      </Box>
   )
})

export default AboutCompany
