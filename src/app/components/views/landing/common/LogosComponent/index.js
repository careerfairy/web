import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Grid } from "@mui/material";
import Fade from "@stahl.luke/react-reveal/Fade";

const styles = {
   root: {
      width: "100%",
      marginTop: (theme) => theme.spacing(2),
   },
   gridItem: {
      display: "grid",
      placeItems: "center",
   },
};

const LogosComponent = ({ children }) => {
   return (
      <Fade up>
         <Grid container justifyContent="center" spacing={3} sx={styles.root}>
            {children.map((child) => (
               <Grid
                  sx={styles.gridItem}
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
