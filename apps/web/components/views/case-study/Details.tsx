import React from "react"
import Section from "./Section"
import Chip from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
import Fade from "@stahl.luke/react-reveal/Fade"
import { parseIndustryTag } from "../../cms/util"
const styles = {
   root: {},
   chip: {},
}
interface Props {
   industries: string[]
   published: string
}
const Details = ({ industries, published }: Props) => {
   return (
      <Section verticalSpacing={3} disableBottomPadding sx={styles.root}>
         <Fade bottom>
            <Stack direction={"row"} spacing={2}>
               <Chip
                  variant="outlined"
                  size={"medium"}
                  color="primary"
                  label={published}
               />
               {industries?.map((industry) => (
                  <Chip
                     key={industry}
                     variant="outlined"
                     size={"medium"}
                     sx={{
                        textTransform: "",
                     }}
                     color={"secondary"}
                     label={parseIndustryTag(industry)}
                  />
               ))}
            </Stack>
         </Fade>
      </Section>
   )
}

export default Details
