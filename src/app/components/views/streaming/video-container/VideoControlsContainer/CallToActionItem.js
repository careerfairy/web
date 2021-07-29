import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import PropTypes from 'prop-types'
import { Button, IconButton, LinearProgress, Typography } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/MoreVert";

const useStyles = makeStyles(({ palette }) => ({
   root: {
      display: "flex",
      padding: 4,
   },
   card: {
      display: "flex",
      flexDirection: "column",
      minWidth: 270,
      width: "100%",
      borderRadius: 12,
      "& > *:nth-child(1)": {
         // marginRight: spacing(2),
      },
      "& > *:nth-child(2)": {
         flex: "auto",
      },
   },
   avatar: {},
   heading: {
      // fontFamily: family,
      fontSize: 16,
      marginBottom: 0,
   },
   subheader: {
      // fontFamily: family,
      fontSize: 14,
      color: palette.grey[600],
      letterSpacing: "1px",
      marginBottom: 4,
   },
   value: {
      marginLeft: 8,
      fontSize: 14,
      color: palette.grey[500],
   },
   label: {
      fontSize: 12,
   },
   description: {
      fontSize: 10,
   },
   settingBtn: {
      position: "absolute",
      right: 0,
      top: 0,
   },
}));

const useSliderStyles = makeStyles(() => ({
   root: {
      height: 4,
   },
   rail: {
      borderRadius: 10,
      height: 4,
      backgroundColor: "rgb(202,211,216)",
   },
   track: {
      borderRadius: 10,
      height: 4,
      backgroundColor: "rgb(117,156,250)",
   },
   thumb: {
      display: "none",
   },
}));

function LinearProgressWithLabel({ engagementData:{percentage} }) {
   return (
      <Box width="100%" display="flex" alignItems="center">
         <Box width="100%" mr={1}>
            <LinearProgress variant="determinate" value={percentage} />
         </Box>
         <Box minWidth={35}>
            <Typography variant="body2" color="textSecondary">{`${Math.round(
               percentage
            )}%`}</Typography>
         </Box>
      </Box>
   );
}

LinearProgressWithLabel.propTypes = {
   /**
    * The value of the progress indicator for the determinate and buffer variants.
    * Value between 0 and 100.
    */
   value: PropTypes.number.isRequired,
};



export const CallToActionItem = React.memo(
   ({
      style,
      callToAction: {
         active,
         id,
         buttonUrl,
         created,
         message,
         numberOfUsersWhoClickedLink,
         numberOfUsersWhoDismissed,
         buttonText,
      },
      handleToggleActive,
   }) => {
      const classes = useStyles();
      const [engagementData, setEngagementData] = useState({
         total: 0,
         percentage: 0,
         noOfEngagement: 0,
         noOfDismissal: 0,
      });

      useEffect(() => {
         const noOfEngagement = numberOfUsersWhoClickedLink || 0;
         const noOfDismissal = numberOfUsersWhoDismissed || 0;
         const totalEngagement = Math.round(noOfDismissal + noOfEngagement);
         const percentage =
            Math.round((noOfEngagement / totalEngagement) * 100) || 0;
         setEngagementData({
            total: totalEngagement,
            percentage: percentage,
            noOfEngagement: noOfEngagement,
            noOfDismissal: noOfDismissal,
         });
      }, [numberOfUsersWhoClickedLink, numberOfUsersWhoDismissed]);
      return (
         <div style={style} className={classes.root}>
            <Card className={clsx(classes.card)} elevation={2}>
               <Box position="relative" p={2} flexGrow={1}>
                  <IconButton size="small" className={classes.settingBtn}>
                     <SettingsIcon />
                  </IconButton>
                  <Typography className={classes.label} color="textSecondary">
                     Button Text:
                  </Typography>
                  <Typography gutterBottom className={classes.description}>
                     {buttonText}
                  </Typography>
                  {message ? (
                     <>
                        <Typography
                           className={classes.label}
                           color="textSecondary"
                           gutterBottom
                        >
                           Message
                        </Typography>
                        <Typography gutterBottom className={classes.description}>
                           {message}
                        </Typography>
                     </>
                  ) : null}
                  <Typography className={classes.label} color="textSecondary">
                     Engagement:
                  </Typography>
                  <Box display={"flex"} alignItems={"center"}>
                     <LinearProgressWithLabel engagementData={engagementData} value={engagementData.percentage} />
                  </Box>
               </Box>
               <Button
                  color="primary"
                  fullWidth
                  variant={active ? "contained" : "text"}
                  onClick={() => {
                     handleToggleActive(id, active);
                  }}
               >
                  {active ? "Send Call To Action" : "Deactivate Call To Action"}
               </Button>
            </Card>
         </div>
      );
   }
);

export default CallToActionItem;
