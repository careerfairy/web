import { Box, Button } from "@mui/material"
import styles from "components/views/livestream-dialog/views/livestream-details/action-button/Styles"

const ActionButton = () => {
   return (
      <>
         <Box component="span" width="100%" maxWidth={572}>
            <Button
               color={"secondary"}
               variant={"contained"}
               sx={[
                  styles.btn,
                  {
                     cursor: "initial",
                     "&:hover": {
                        bgcolor: "secondary.main",
                        boxShadow: "none",
                     },
                  },
               ]}
               fullWidth
               disableElevation
               disableRipple
               size="large"
            >
               Register to live stream
            </Button>
         </Box>
      </>
   )
}

export default ActionButton
