import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      marginTop: theme.spacing(2),
   },
   gridItem:{
      display: "grid",
      placeItems: "center",
   }
}));

const LogosComponent = ({ children }) => {
   const classes = useStyles();

   return (
      <Grid container justify="center" spacing={3} className={classes.root}>
         {children.map((child) => (
            <Grid className={classes.gridItem} key={child.key} item xs>{child}</Grid>
         ))}
      </Grid>
   );
};
export default LogosComponent;
