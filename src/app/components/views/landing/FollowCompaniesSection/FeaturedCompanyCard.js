import React from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { Box, Button } from "@material-ui/core";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
      padding: theme.spacing(3),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: theme.spacing(3),
   },
   imageWrapper: {},
   logo: {
      objectFit: "contain",
      padding: theme.spacing(1),
   },
   btn: {
      borderRadius: theme.spacing(2),
   },
}));
const FeaturedCompanyCard = ({ company }) => {
   const classes = useStyles();
   return (
      <div className={classes.root}>
         <img
            alt={`${company.universityName}-logo`}
            width={100}
            height={100}
            loading="lazy"
            className={classes.logo}
            src={getResizedUrl(company.logoUrl, "sm")}
         />
         <Box p={2}>
            <Button
               variant={"outlined"}
               color="primary"
               className={classes.btn}
            >
               Follow
            </Button>
         </Box>
      </div>
   );
};

export default FeaturedCompanyCard;
