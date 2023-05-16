import { FC } from "react"
import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { DummyContent } from "../LivestreamDetailsView"

const styles = sxStyles({
   root: {},
})

interface Props {
   speakers?: Speaker[]
}
const Speakers: FC<Props> = ({ speakers }) => {
   if (!speakers) {
      return null
   }

   return (
      <Box sx={styles.root}>
         <SectionTitle>Speakers</SectionTitle>
         <DummyContent />
      </Box>
   )
}

export default Speakers
