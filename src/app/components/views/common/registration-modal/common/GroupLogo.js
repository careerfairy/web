import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CardMedia } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      height: 150,
      maxWidth: 350,
      alignSelf: "center",
   },
   image: {
      objectFit: "contain",
      maxWidth: "80%",
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      background: theme.palette.common.white,
   },
}));
const GroupLogo = ({ logoUrl, alt }) => {
   const classes = useStyles();
   return (
      <CardMedia className={classes.media}>
         <img src={logoUrl} className={classes.image} alt={alt} />
      </CardMedia>
   );
};

export default GroupLogo;
