import React from "react"
import Section from "./Section"
import Chip from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { parseIndustryTag } from "../../cms/util"
const styles = {
   root: {
      py: {
         xs: 2,
         md: 4,
      },
   },
   chip: {},
}
interface Props {
   industries: string[]
   published: string
}
const Details = ({ industries, published }: Props) => {
   return (
      <Section sx={styles.root}>
         <Stack direction={"row"} spacing={2}>
            <Chip
               variant="outlined"
               size={"medium"}
               color="primary"
               label={published}
            />
            {industries.map((industry) => (
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
      </Section>
   )
}

export default Details
