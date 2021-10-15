import React from "react";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      "& img": {},
      boxShadow: theme.shadows[1],
      background: theme.palette.common.white,
   },
}));

const CompanyLogo = ({ src }) => {
   const classes = useStyles();
   return (
      <Avatar
         className={classes.root}
         variant="rounded"
         src={getResizedUrl(src, "xs")}
      />
   );
};

export default CompanyLogo;
