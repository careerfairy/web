import { forwardRef } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const AboutLivestream = forwardRef<HTMLDivElement, Props>(
   function AboutLivestream({ children }, ref) {
      return (
         <Box ref={ref}>
            <SectionTitle>About the live stream</SectionTitle>
            <DummyContent />
         </Box>
      )
   }
)

export default AboutLivestream
