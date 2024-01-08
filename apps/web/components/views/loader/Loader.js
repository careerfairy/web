import { Box, CircularProgress } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      zIndex: -1, // workaround to fix loading spinner showing on top of other elements
   },

   progress: {
      position: "fixed",
      top: "50%",
      left: "50%",
   },
})

const Loader = () => {
   return (
      <Box sx={styles.root} className="loading-container">
         <CircularProgress sx={styles.progress} />
      </Box>
   )
}

export default Loader
