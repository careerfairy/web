import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography } from "@material-ui/core";
import HeroButton from "../HeroSection/HeroButton";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: theme.spacing(2),
   },
}));
const FollowCompaniesPrompt = () => {
   const classes = useStyles();
   return (
      <div className={classes.root}>
         <Box>
            <HeroButton
               href="/wishlist"
               color="secondary"
               size={"small"}
               variant="outlined"
            >
               Add to Wishlist
            </HeroButton>
         </Box>
      </div>
   );
};

export default FollowCompaniesPrompt;
