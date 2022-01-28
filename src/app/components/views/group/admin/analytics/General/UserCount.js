import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
   Avatar,
   Card,
   CardContent,
   Grid,
   Typography,
   CircularProgress,
} from "@material-ui/core";
import PeopleIcon from "@material-ui/icons/PeopleOutlined";
import { withFirebase } from "../../../../../../context/firebase/FirebaseServiceContext";
import indigo from "@material-ui/core/colors/indigo";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
   root: {
      height: "100%",
   },
   avatar: {
      backgroundColor: indigo[600],
      height: 56,
      width: 56,
   },
}));

const UserCount = ({
   fetching,
   currentUserDataSet,
   group,
   totalUsers,
   timeFrames,
   className,
   ...rest
}) => {
   const classes = useStyles();

   return (
      <Card className={clsx(classes.root, className)} {...rest}>
         <CardContent>
            <Grid container justifyContent="space-between" spacing={3}>
               <Grid item>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                     {currentUserDataSet.displayName.toUpperCase()}
                  </Typography>
                  <Typography color="textPrimary" variant="h3">
                     {fetching ? <CircularProgress /> : totalUsers || 0}
                  </Typography>
               </Grid>
               <Grid item>
                  <Avatar className={classes.avatar}>
                     <PeopleIcon />
                  </Avatar>
               </Grid>
            </Grid>
         </CardContent>
      </Card>
   );
};

UserCount.propTypes = {
   className: PropTypes.string,
};

export default withFirebase(UserCount);
