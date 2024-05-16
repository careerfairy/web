import { Box, Button } from "@mui/material"
import styles from "components/views/livestream-dialog/views/livestream-details/action-button/Styles"

const ActionButton = () => {
   return (
      <>
         <Box component="span" width="100%" maxWidth={572}>
            <Button
               color={"secondary"}
               variant={"contained"}
               sx={styles.btn}
               fullWidth
               disableElevation
               size="large"
            >
               Register to live stream
            </Button>
         </Box>
      </>
   )
}

export default ActionButton
