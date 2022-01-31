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
} from "@mui/material";
import LibraryAddCheckIcon from "@mui/icons-material/LibraryAddCheck";
import { withFirebase } from "../../../../../../context/firebase/FirebaseServiceContext";
import PercentageDisplay from "./common/PercentageDisplay";
import makeStyles from '@mui/styles/makeStyles';
import { green } from '@mui/material/colors';

const useStyles = makeStyles((theme) => ({
   root: {
      height: "100%",
   },
   avatar: {
      backgroundColor: green[600],
      height: 56,
      width: 56,
   },
}));

const TotalUniqueRegistrations = ({
   globalTimeFrame,
   uniqueRegistrationsStatus,
   fetchingStreams,
   totalUniqueRegistrations,
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
                     UNIQUE REGISTRATIONS
                  </Typography>
                  <Typography color="textPrimary" variant="h3">
                     {fetchingStreams ? (
                        <CircularProgress />
                     ) : (
                        totalUniqueRegistrations
                     )}
                  </Typography>
               </Grid>
               <Grid item>
                  <Avatar className={classes.avatar}>
                     <LibraryAddCheckIcon />
                  </Avatar>
               </Grid>
            </Grid>
            {uniqueRegistrationsStatus.dataToCompare && (
               <PercentageDisplay
                  percentage={uniqueRegistrationsStatus.percentage}
                  fetchingStreams={fetchingStreams}
                  globalTimeFrame={globalTimeFrame}
                  positive={uniqueRegistrationsStatus.positive}
               />
            )}
         </CardContent>
      </Card>
   );
};

TotalUniqueRegistrations.propTypes = {
   className: PropTypes.string,
};

export default withFirebase(TotalUniqueRegistrations);
