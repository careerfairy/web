import React from "react";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   root: {
      "& img": {},
      boxShadow: theme.shadows[1],
      background: theme.palette.common.white,
   },
}));

const CompanyLogo = ({ src }) => {
   const classes = useStyles();
   return <Avatar className={classes.root} variant="rounded" src={src} />;
};

export default CompanyLogo;
