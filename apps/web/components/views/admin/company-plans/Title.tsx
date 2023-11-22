import { Box, Typography } from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      pt: 3.375,
      display: "flex",
      justifyContent: "center",
   },
   text: {
      fontWeight: 700,
      textAlign: "center",
      fontSize: "2.28571rem",
   },
})

const Title = () => {
   return (
      <Box sx={styles.root}>
         <Typography component="span" sx={styles.text}>
            Manage our clients{" "}
            <Typography component="span" color="secondary" sx={styles.text}>
               Sparks trial
            </Typography>
         </Typography>
      </Box>
   )
}

export default Title
