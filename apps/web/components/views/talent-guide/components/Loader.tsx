import { Box, LinearProgress, linearProgressClasses } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      height: "100%",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "fixed",
   },
   progress: {
      width: "50%",
      height: 10,
      borderRadius: 10,
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: 10,
      },
   },
})

export const Loader = () => {
   return (
      <Box sx={styles.root}>
         <LinearProgress color="primary" sx={styles.progress} />
      </Box>
   )
}
