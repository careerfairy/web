import React from "react"
import clsx from "clsx"
import PropTypes from "prop-types"
import {
   Avatar,
   Card,
   CardContent,
   CircularProgress,
   Grid,
   Typography,
} from "@mui/material"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { withFirebase } from "../../../../../../context/firebase/FirebaseServiceContext"
import PercentageDisplay from "./common/PercentageDisplay"
import makeStyles from "@mui/styles/makeStyles"
import { green } from "@mui/material/colors"

const useStyles = makeStyles((theme) => ({
   root: {
      height: "100%",
   },
   avatar: {
      backgroundColor: theme.palette.secondary.main,
      height: 56,
      width: 56,
   },
}))

const TotalUniqueParticipatingStudents = ({
   globalTimeFrame,
   uniqueParticipationStatus,
   fetchingStreams,
   totalUniqueParticipatingStudents,
   timeFrames,
   className,
   ...rest
}) => {
   const classes = useStyles()

   return (
      <Card className={clsx(classes.root, className)} {...rest}>
         <CardContent>
            <Grid container justifyContent="space-between" spacing={3}>
               <Grid item>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                     UNIQUE PARTICIPATING STUDENTS
                  </Typography>
                  <Typography color="textPrimary" variant="h3">
                     {fetchingStreams ? (
                        <CircularProgress />
                     ) : (
                        totalUniqueParticipatingStudents
                     )}
                  </Typography>
               </Grid>
               <Grid item>
                  <Avatar className={classes.avatar}>
                     <VisibilityIcon />
                  </Avatar>
               </Grid>
            </Grid>
            {uniqueParticipationStatus.dataToCompare && (
               <PercentageDisplay
                  percentage={uniqueParticipationStatus.percentage}
                  fetchingStreams={fetchingStreams}
                  globalTimeFrame={globalTimeFrame}
                  positive={uniqueParticipationStatus.positive}
               />
            )}
         </CardContent>
      </Card>
   )
}

TotalUniqueParticipatingStudents.propTypes = {
   className: PropTypes.string,
}

export default withFirebase(TotalUniqueParticipatingStudents)
