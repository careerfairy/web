import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
   },
}));

const LoadingDisplay = () => {
   const classes = useStyles();

   return (
      <Grid className={classes.container} container>
         <CircularProgress />
      </Grid>
   );
};

export default LoadingDisplay;
