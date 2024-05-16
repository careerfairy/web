import { sxStyles } from "@careerfairy/shared-ui"
import CloseIcon from "@mui/icons-material/CloseRounded"
import { Box, IconButton } from "@mui/material"

const styles = sxStyles({
   backButton: {
      position: "absolute",
      top: 0,
      right: 0,
      padding: 1,
      color: "white",
   },
   closeIcon: {
      fontSize: "24px",
      color: "white",
   },
})

type BackAndCloseButtonProps = {
   handleCloseDialog?: () => void
}

const BackAndCloseButton = ({ handleCloseDialog }: BackAndCloseButtonProps) => {
   return (
      <Box sx={styles.backButton}>
         <IconButton onClick={handleCloseDialog}>
            <CloseIcon sx={styles.closeIcon} />
         </IconButton>
      </Box>
   )
}

export default BackAndCloseButton
