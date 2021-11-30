import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Box, Hidden, Toolbar } from "@material-ui/core";
import { MainLogo, MiniLogo } from "../../../components/logos";

const useStyles = makeStyles((theme) => ({}));

const TopBar = ({}) => {
   const classes = useStyles();

   return (
      <AppBar elevation={1}>
         <Toolbar className={classes.toolbar}>
            <Hidden smDown>
               <MainLogo white />
            </Hidden>
            <Hidden mdUp>
               <MiniLogo />
            </Hidden>
            <Box flex={1} />
         </Toolbar>
      </AppBar>
   );
};

export default TopBar;
