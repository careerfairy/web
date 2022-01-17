import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Fade from "@stahl.luke/react-reveal/Fade";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      marginTop: theme.spacing(2),
   },
   gridItem: {
      display: "grid",
      placeItems: "center",
   },
}));

const LogosComponent = ({ children }) => {
   const classes = useStyles();

   return (
      <Fade up>
         <Grid
            container
            justifyContent="center"
            spacing={3}
            className={classes.root}
         >
            {children.map((child) => (
               <Grid
                  className={classes.gridItem}
                  key={child.key}
                  item
                  xs={12}
                  sm={6}
                  md={3}
               >
                  {child}
               </Grid>
            ))}
         </Grid>
      </Fade>
   );
};
export default LogosComponent;
