import React from "react";
import { Divider } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
   whiteDivider: {
      background: theme.palette.common.white,
   },
}));

export const WhiteDivider = ({ ...props }) => {
   const classes = useStyles();
   return (
      <Divider variant="middle" {...props} className={classes.whiteDivider} />
   );
};
