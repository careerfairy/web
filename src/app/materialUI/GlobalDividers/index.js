import React from "react";
import { Divider, makeStyles } from "@material-ui/core";

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
