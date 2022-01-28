import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
   Avatar,
   Card,
   CardContent,
   CircularProgress,
   Grid,
   Typography,
} from "@material-ui/core";
import { withFirebase } from "../../../../../../context/firebase/FirebaseServiceContext";
import AddToPhotosRoundedIcon from "@material-ui/icons/AddToPhotosRounded";
import PercentageDisplay from "./common/PercentageDisplay";
import { makeStyles } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

const useStyles = makeStyles((theme) => ({
   root: {
      height: "100%",
   },
   avatar: {
      backgroundColor: red[600],
      height: 56,
      width: 56,
   },
}));

const TotalRegistrations = ({
   globalTimeFrame,
   registrationsStatus,
   fetchingStreams,
   totalRegistrations,
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
                     REGISTRATIONS
                  </Typography>
                  <Typography color="textPrimary" variant="h3">
                     {fetchingStreams ? (
                        <CircularProgress />
                     ) : (
                        totalRegistrations
                     )}
                  </Typography>
               </Grid>
               <Grid item>
                  <Avatar className={classes.avatar}>
                     <AddToPhotosRoundedIcon />
                  </Avatar>
               </Grid>
            </Grid>
            {registrationsStatus.dataToCompare && (
               <PercentageDisplay
                  percentage={registrationsStatus.percentage}
                  fetchingStreams={fetchingStreams}
                  globalTimeFrame={globalTimeFrame}
                  positive={registrationsStatus.positive}
               />
            )}
         </CardContent>
      </Card>
   );
};

TotalRegistrations.propTypes = {
   className: PropTypes.string,
};

export default withFirebase(TotalRegistrations);
