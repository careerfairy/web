import React, { memo, useEffect, useState } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import {
  Button,
  IconButton,
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
import ResendIcon from "@material-ui/icons/Repeat";
import {
  callToActionsDictionary,
  callToActionsSocialsDictionary,
} from "../../../../util/constants/callToActions";
import RubberBand from "react-reveal/RubberBand";

const useStyles = makeStyles(({ palette }) => ({
  root: {},
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
  listItemAvatar: {
    height: "100%",
    backgroundColor: (props) => alpha(props.color, 0.3),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "& svg": {
      fontSize: 40,
      color: palette.common.white,
    },
  },
  settingBtn: {
    position: "absolute",
    right: 0,
    top: 0,
  },
}));

const SettingsDropdown = ({
  className,
  callToAction,
  handleClickEditCallToAction,
  handleClickDeleteCallToAction,
  handleClickResendCallToAction,
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

const EngagementChart = memo(({ percentage, noOfEngagement, total }) => {
  return (
    <Box position="relative" display="inline-flex">
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
        <RubberBand spy={noOfEngagement}>
          <Typography variant="h6" component="div" color="textSecondary">
            {noOfEngagement}
          </Typography>
        </RubberBand>
      </Box>
    </Box>
  );
});

export const CallToActionItem = React.memo((props) => {
  const {
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
      jobData,
      socialData,
    },
    handleToggleActive,
    handleClickEditCallToAction,
    handleClickDeleteCallToAction,
    handleClickResendCallToAction,
  } = props;

  const isJobPosting = type === "jobPosting";

  const [color, setColor] = useState(
    callToActionsDictionary[type]?.color || callToActionsDictionary.custom.color
  );

  const classes = useStyles({ color });

  const [engagementData, setEngagementData] = useState({
    total: 0,
    percentage: 0,
    noOfEngagement: 0,
    noOfDismissal: 0,
  });

  const [icon, setIcon] = useState(callToActionsDictionary.custom.icon);

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

  useEffect(() => {
    (function handleSetIcon() {
      const isSocial = type === "social";
      let newIcon = callToActionsDictionary.custom.icon;
      let newColor =
        callToActionsDictionary[type]?.color ||
        callToActionsDictionary.custom.color;
      if (isSocial) {
        if (socialData.socialType) {
          newIcon = callToActionsSocialsDictionary[socialData.socialType].icon;
          newColor =
            callToActionsSocialsDictionary[socialData.socialType].color;
        }
      } else if (callToActionsDictionary[type]) {
        newIcon = callToActionsDictionary[type].icon;
        newColor = callToActionsDictionary[type].color;
      }
      setColor(newColor);
      setIcon(newIcon);
    })();
  }, [type, socialData]);

  return (
    <ListItem
      divider
      style={{
        height: 200,
      }}
    >
      <ListItemAvatar className={classes.listItemAvatar}>{icon}</ListItemAvatar>
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
              primary={isJobPosting ? "Job Description" : "Message"}
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
              handleClickDeleteCallToAction={handleClickDeleteCallToAction}
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
