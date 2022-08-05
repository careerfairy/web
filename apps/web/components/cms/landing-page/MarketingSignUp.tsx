import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import { Button, Grid, Typography } from "@mui/material"
import { useCallback } from "react"
import { marketingServiceInstance } from "../../../data/firebase/MarketingService"
import { marketingSignUpFormId } from "../constants"

const styles = sxStyles({
   container: {
      backgroundColor: "primary.main",
   },
})

const MarketingSignUp = () => {
   const handleClick = useCallback(() => {
      marketingServiceInstance
         .create({
            firstName: "Carlos",
            lastName: "Test",
            email: "carlo3s@careerfairy.io",
            fieldOfStudy: {
               id: "1",
               name: "Astro",
            },
            utmParams: {
               utm_campaign: "test",
            },
         })
         .then((_) => {
            console.log("Created with success")
         })
         .catch((e) => {
            console.log("failed", e)
         })
   }, [])

   return (
      <Box id={marketingSignUpFormId} sx={styles.container}>
         <Container>
            <Box p={3}>
               <Typography variant="h4">Stay connected</Typography>
               <Typography variant="subtitle1">
                  {"You'll"} receive emails for future livestream events
               </Typography>

               <Grid container>
                  <Grid item>
                     <Button
                        variant={"outlined"}
                        color={"secondary"}
                        onClick={handleClick}
                     >
                        Create
                     </Button>
                  </Grid>
               </Grid>
            </Box>
         </Container>
      </Box>
   )
}

export default MarketingSignUp
