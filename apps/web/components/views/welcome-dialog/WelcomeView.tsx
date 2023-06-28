import { Box, Button, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   container: {
      backgroundColor: "white",
      borderRadius: 5,
      paddingX: 2,
      paddingY: 6,
   },
   welcome: {
      fontWeight: 700,
      fontSize: "32px",
      letterSpacing: "0.131px",
   },
   button: {
      boxShadow: "none",
      textTransform: "none",
      padding: "8px 20px",
   },
})

export const WelcomeView = ({ onClick }: { onClick: () => void }) => {
   return (
      <Box sx={styles.container}>
         <Stack spacing={1}>
            <Typography fontSize={48} textAlign="center">
               🚀
            </Typography>
            <Typography textAlign="center" sx={styles.welcome}>
               Welcome to{" "}
               <Box component="span" sx={{ color: "primary.main" }}>
                  CareerFairy
               </Box>
               !
            </Typography>
            <Typography textAlign="center" fontSize="16px">
               Explore, connect, and start your career journey with us!
            </Typography>
            <Box textAlign="center" pt={1}>
               <Button
                  onClick={onClick}
                  sx={styles.button}
                  color="primary"
                  variant="contained"
               >
                  Start browsing now
               </Button>
            </Box>
         </Stack>
      </Box>
   )
}

export default WelcomeView
