import React from "react";
import { Avatar, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";
import clsx from "clsx";
import ImageIcon from "@material-ui/icons/Image";

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
   },
   withBackground: {
      boxShadow: theme.shadows[2],
      background: theme.palette.common.white,
   },
}));

const CompanyLogo = ({ src, withBackground, onClick }) => {
   const classes = useStyles();
   return (
      <Avatar
         className={clsx(classes.root, {
            [classes.withBackground]: withBackground,
         })}
         variant="rounded"
         src={getResizedUrl(src, "xs")}
      >
         <Button size="large" startIcon={<ImageIcon />} onClick={onClick}>
            Upload image
         </Button>
      </Avatar>
   );
};

export default CompanyLogo;
