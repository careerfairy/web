import { sxStyles } from "../../../../../../types/commonTypes"
import { Grid } from "@mui/material"
import Box from "@mui/material/Box"
import AggregatedSources from "./AggregatedSources"

const styles = sxStyles({
   container: {
      minHeight: "100%",
      paddingBottom: (theme) => theme.spacing(3),
      paddingTop: (theme) => theme.spacing(3),
      width: "100%",
   },
})

const Sources = (props) => {
   console.log("sources received props", props)
   return (
      <Box p={3}>
         <Grid container spacing={3}>
            <Grid item xs={12}>
               <AggregatedSources />
            </Grid>
         </Grid>
      </Box>
   )
}

export default Sources
