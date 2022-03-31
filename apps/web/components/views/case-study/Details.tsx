import React from "react"
import Section from "./Section"
import Chip from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
const styles = {
   root: {
      py: {
         xs: 2,
         md: 4,
      },
   },
}
const Details = ({}) => {
   return (
      <Section sx={styles.root}>
         <Stack direction={"row"} spacing={2}>
            <Chip variant="outlined" color="primary" label={"May 22, 2020"} />
            <Chip variant="outlined" color={"secondary"} label={"Buisness"} />
            <Chip variant="outlined" color={"secondary"} label={"Coaching"} />
            <Chip variant="outlined" color={"secondary"} label={"Marketing"} />
         </Stack>
      </Section>
   )
}

export default Details
