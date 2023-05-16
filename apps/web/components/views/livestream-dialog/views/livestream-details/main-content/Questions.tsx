import { forwardRef } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const Questions = forwardRef<HTMLDivElement, Props>(function Questions(
   { children },
   ref
) {
   return (
      <Box ref={ref}>
         <SectionTitle>Upcoming questions</SectionTitle>
         <DummyContent />
      </Box>
   )
})

export default Questions
