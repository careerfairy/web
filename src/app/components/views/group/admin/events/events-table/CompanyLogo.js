import React from "react";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
         borderRadius: theme.spacing(1),
      },
      width: 170,
      height: 70,
      boxShadow: theme.shadows[2],
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
