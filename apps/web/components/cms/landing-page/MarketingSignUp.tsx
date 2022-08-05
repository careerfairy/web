import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import { Grid, Typography } from "@mui/material"

const styles = sxStyles({
   container: {
      backgroundColor: "primary.main",
   },
})

const MarketingSignUp = () => {
   return (
      <Box sx={styles.container}>
         <Container>
            <Box p={3}>
               <Typography variant="h4">Stay connected</Typography>
               <Typography variant="subtitle1">
                  {"You'll"} receive emails for future livestream events
               </Typography>

               <Grid container>
                  <Grid item>grid</Grid>
               </Grid>
            </Box>
         </Container>
      </Box>
   )
}

export default MarketingSignUp
