import { FC } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const AboutLivestream: FC<Props> = () => {
   return (
      <Box>
         <SectionTitle>About the live stream</SectionTitle>
         <DummyContent />
      </Box>
   )
}

export default AboutLivestream
