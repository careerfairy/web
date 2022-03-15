import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { CircularProgress, Grid } from "@mui/material"

const useStyles = makeStyles((theme) => ({
   container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
   },
}))

const LoadingDisplay = () => {
   const classes = useStyles()

   return (
      <Grid className={classes.container} container>
         <CircularProgress />
      </Grid>
   )
}

export default LoadingDisplay
