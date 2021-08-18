import React, { useEffect, useState } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import {
   Button,
   CircularProgress,
   IconButton,
   LinearProgress,
   ListItem,
   ListItemAvatar,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   Tooltip,
   Typography,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/MoreVert";
import LinkifyText from "../../../../util/LinkifyText";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ResendIcon from '@material-ui/icons/Repeat';
import { callToActionsIconsDictionary } from "../../../../util/constants/callToActions";

const useStyles = makeStyles(({ palette }) => ({
   root: {
      display: "flex",
      padding: 4,
   },
   detailsWrapper: {
      display: "flex",
      flexDirection: "column",
      width: "50%",
   },
   headerActionsWrapper: {
      position: "relative",
      flexDirection: "column",
      width: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
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
   listItemAvatar: {
      height: "100%",
      backgroundColor: (props) => alpha(props.color, 0.3),
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "& svg": {
         fontSize: 40,
         color: palette.common.white,
         // color: props => props.color,
      },
   },
   icon: {
      // margin: "auto",
   },
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

const useSecondaryStyles = makeStyles(({ palette }) => ({
   card: {
      borderRadius: 12,
      textAlign: "center",
      minWidth: 270,
      width: "100%",
   },
   cardContent: {
      backgroundColor: (props) => alpha(props.color, 0.3),
   },
   icon: {
      margin: "auto",
      "& svg": {
         fontSize: 40,
         color: palette.common.white,
         // color: props => props.color,
      },
   },
   heading: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      letterSpacing: "0.5px",
      marginTop: 8,
      marginBottom: 0,
   },
   subheader: {
      fontSize: 14,
      color: palette.grey[500],
      marginBottom: "0.875em",
   },
   statLabel: {
      fontSize: 12,
      color: palette.grey[500],
      fontWeight: 500,
      fontFamily:
         '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      margin: 0,
   },
   statValue: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 4,
      letterSpacing: "1px",
   },
}));

const LinearProgressWithLabel = ({
   engagementData: { total, percentage, noOfEngagement, noOfDismissal },
}) => {
   return (
      <Tooltip title="This bar shows you the number of individuals who clicked on the call to action">
         <Box width="100%" display="flex" alignItems="center">
            <Box width="100%" mr={1}>
               <LinearProgress variant="determinate" value={percentage} />
            </Box>
            <Box minWidth={35}>
               <Typography variant="body2" color="textSecondary">
                  {/*   {`${Math.round(*/}
                  {/*   percentage*/}
                  {/*)}%`}*/}
                  {`${noOfEngagement}/${total}`}
               </Typography>
            </Box>
         </Box>
      </Tooltip>
   );
};

LinearProgressWithLabel.propTypes = {
   /**
    * The value of the progress indicator for the determinate and buffer variants.
    * Value between 0 and 100.
    */
   engagementData: PropTypes.object.isRequired,
};

const Section = ({ label, description }) => {
   const classes = useStyles();

   return (
      <React.Fragment>
         <Typography noWrap className={classes.label} color="textSecondary">
            {label}
         </Typography>
         <Typography noWrap gutterBottom className={classes.description}>
            <LinkifyText>{description}</LinkifyText>
         </Typography>
      </React.Fragment>
   );
};

const SettingsDropdown = ({
   className,
   callToAction,
   handleClickEditCallToAction,
   handleClickDeleteCallToAction,
                             handleClickResendCallToAction
}) => {
   const [anchorEl, setAnchorEl] = useState(null);

   const handleOpen = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   return (
      <React.Fragment>
         <IconButton onClick={handleOpen} size="small" className={className}>
            <SettingsIcon />
         </IconButton>
         <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
         >
            <MenuItem
               onClick={() => {
                  handleClickEditCallToAction(callToAction);
               }}
            >
               <ListItemIcon>
                  <EditIcon />
               </ListItemIcon>
               <Typography variant="inherit">Edit</Typography>
            </MenuItem>
            <MenuItem
               onClick={() => {
                  handleClickDeleteCallToAction(callToAction.id);
               }}
            >
               <ListItemIcon>
                  <DeleteIcon />
               </ListItemIcon>
               <Typography variant="inherit">Delete</Typography>
            </MenuItem>
            <MenuItem
               onClick={() => {
                  handleClickResendCallToAction(callToAction.id);
               }}
            >
               <ListItemIcon>
                  <ResendIcon />
               </ListItemIcon>
               <Typography variant="inherit">Resend</Typography>
            </MenuItem>
         </Menu>
      </React.Fragment>
   );
};

const EngagementChart = ({ percentage, noOfEngagement, total, ...props }) => {
   return (
      <Tooltip
         title={`Of the ${total} interactions ${noOfEngagement}(${percentage}%) of users clicked on the call to action`}
      >
         <Box position="relative" display="inline-flex">
            <CircularProgress
               variant="determinate"
               value={percentage}
               {...props}
            />
            <Box
               top={0}
               left={0}
               bottom={0}
               right={0}
               position="absolute"
               display="flex"
               alignItems="center"
               justifyContent="center"
            >
               <Typography
                  variant="caption"
                  component="div"
                  color="textSecondary"
               >
                  {noOfEngagement}
               </Typography>
            </Box>
         </Box>
      </Tooltip>
   );
};

export const CallToActionItem = React.memo((props) => {
   const {
      style,
      index,
      callToAction: {
         active,
         id,
         buttonUrl,
         created,
         message,
         numberOfUsersWhoClickedLink,
         numberOfUsersWhoDismissed,
         buttonText,
         type,
        jobData
      },
      handleToggleActive,
      handleClickEditCallToAction,
      handleClickDeleteCallToAction,
      handleClickResendCallToAction,
   } = props;

   const isJobPosting = type === "jobPosting"
   const styles = useSecondaryStyles({
      color:
         callToActionsIconsDictionary[type]?.color ||
         callToActionsIconsDictionary.custom.color,
   });
   const classes = useStyles({
      color:
         callToActionsIconsDictionary[type]?.color ||
         callToActionsIconsDictionary.custom.color,
   });
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
      <ListItem divider style={style}>
         <ListItemAvatar className={classes.listItemAvatar}>
            {callToActionsIconsDictionary[type]?.icon ||
               callToActionsIconsDictionary.custom.icon}
         </ListItemAvatar>
         <Box flexGrow={1} minWidth={0} p={1} pr={0}>
            <Box display={"flex"}>
               <div className={classes.detailsWrapper}>
                  {isJobPosting ? (
                     <ListItemText
                        primary="Job Title"
                        secondaryTypographyProps={{
                           noWrap: true,
                        }}
                        secondary={jobData?.jobTitle}
                     />
                  ) : (
                     <ListItemText
                        primary="Button Text"
                        secondaryTypographyProps={{
                           noWrap: true,
                        }}
                        secondary={buttonText}
                     />
                  )}
                  <ListItemText
                     primary="Button Url"
                     secondaryTypographyProps={{
                        noWrap: true,
                     }}
                     secondary={<LinkifyText>{buttonUrl}</LinkifyText>}
                  />
                  <ListItemText
                     primary={isJobPosting ?"Job Description": "Message"}
                     secondaryTypographyProps={{
                        noWrap: true,
                     }}
                     secondary={message}
                  />
               </div>
               <div className={classes.headerActionsWrapper}>
                  <SettingsDropdown
                     handleClickEditCallToAction={handleClickEditCallToAction}
                     handleClickResendCallToAction={handleClickResendCallToAction}
                     handleClickDeleteCallToAction={
                        handleClickDeleteCallToAction
                     }
                     callToAction={props.callToAction}
                     className={classes.settingBtn}
                  />
                  <Typography gutterBottom color="textSecondary">
                     Clicks
                  </Typography>
                  <div>
                     <EngagementChart
                        noOfEngagement={engagementData.noOfEngagement}
                        percentage={engagementData.percentage}
                        total={engagementData.total}
                     />
                  </div>
               </div>
            </Box>
            <Box>
               <Button
                  color="primary"
                  fullWidth
                  variant={active ? "contained" : "outlined"}
                  onClick={() => {
                     handleToggleActive(id, active);
                  }}
               >
                  {active ? "Deactivate Call To Action" : "Send Call To Action"}
               </Button>
            </Box>
         </Box>
      </ListItem>
   );

});

export default CallToActionItem;
