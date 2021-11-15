import React from "react";
import { Box, Paper } from "@material-ui/core";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      maxWidth: 350,
      position: "relative",
      minWidth: 200,
      boxShadow: "none",
      "&:hover": {
         boxShadow: theme.shadows[10],
      },
      borderRadius: theme.spacing(2),
      border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
   },
   content: {
      padding: theme.spacing(2),
   },
   backgroundImage: ({ backgroundImage }) => ({
      background:
         backgroundImage && `url(${getResizedUrl(backgroundImage, "md")})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "auto",
      position: "absolute",
      width: "100%",
      height: "30%",
      overflow: "hidden",
   }),
}));

const UpcomingLivestreamCard = ({ livestream }) => {
   const classes = useStyles({
      backgroundImage: livestream.backgroundImageUrl,
   });

   return (
      <Paper className={classes.root}>
         <img alt="thumbnail" src={getResizedUrl(livestream.backgroundImage)} />
         <Box className={classes.content} height={300} border={1}>
            card
         </Box>
      </Paper>
   );
};

export default UpcomingLivestreamCard;
