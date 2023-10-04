import { Grid } from "@mui/material"
import { FC } from "react"
import LeftColumn from "./LeftColumn"
import { Box } from "@mui/material"

type Props = {
   title: string
   description: string
}

const SectionComponent: FC<Props> = ({ title, description, children }) => {
   return (
      <Box>
         <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
               <LeftColumn title={title} description={description} />
            </Grid>
            <Grid item xs={12} sm={8}>
               {children}
            </Grid>
         </Grid>
      </Box>
   )
}

export default SectionComponent
