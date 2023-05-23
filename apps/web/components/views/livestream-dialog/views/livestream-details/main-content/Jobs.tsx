import { FC } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const Jobs: FC<Props> = () => {
   return (
      <Box>
         <SectionTitle>Linked Jobs</SectionTitle>
         <DummyContent />
      </Box>
   )
}

export default Jobs
