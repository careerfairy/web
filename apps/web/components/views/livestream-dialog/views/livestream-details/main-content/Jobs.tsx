import { forwardRef } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const Jobs = forwardRef<HTMLDivElement, Props>(function Jobs(
   { children },
   ref
) {
   return (
      <Box ref={ref}>
         <SectionTitle>Linked Jobs</SectionTitle>
         <DummyContent />
      </Box>
   )
})

export default Jobs
