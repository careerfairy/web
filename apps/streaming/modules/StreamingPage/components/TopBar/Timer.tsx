import { Box, Typography } from "@mui/material"

import { sxStyles } from "@careerfairy/shared-ui"

const styles = sxStyles({
   root: {
      bgcolor: "error.500",
      color: "white",
      p: 1,
      borderRadius: "3px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   whiteCircle: {
      bgcolor: "white",
      borderRadius: "50%",
      width: 9,
      height: 9,
      mr: "3px",
   },
})

export const Timer = () => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.whiteCircle} />
         <Typography variant="xsmall">16:03</Typography>
      </Box>
   )
}
