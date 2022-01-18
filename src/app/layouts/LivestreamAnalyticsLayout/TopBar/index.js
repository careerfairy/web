import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { AppBar, Box, Hidden, Toolbar } from "@mui/material";
import { MainLogo, MiniLogo } from "../../../components/logos";

const useStyles = makeStyles((theme) => ({}));

const TopBar = ({}) => {
   const classes = useStyles();

   return (
      <AppBar elevation={1}>
         <Toolbar className={classes.toolbar}>
            <Hidden mdDown>
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
