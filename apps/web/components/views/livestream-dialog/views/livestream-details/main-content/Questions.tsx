import { FC } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const Questions: FC<Props> = () => {
   return (
      <Box>
         <SectionTitle>Upcoming questions</SectionTitle>
         <DummyContent />
      </Box>
   )
}

export default Questions
