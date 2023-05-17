import { FC } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

interface Props {}

const AboutCompany: FC<Props> = () => {
   return (
      <Box>
         <SectionTitle>Connect with Our Brand</SectionTitle>
         <DummyContent />
      </Box>
   )
}

export default AboutCompany
