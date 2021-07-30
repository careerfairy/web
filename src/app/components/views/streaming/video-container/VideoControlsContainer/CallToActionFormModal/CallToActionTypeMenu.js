import PropTypes from 'prop-types'
import React from "react";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import {
   Card,
   CardActionArea,
   CardHeader,
   CardMedia,
   DialogContent,
   Grid,
   Tooltip,
} from "@material-ui/core";

import TwitterIcon from "@material-ui/icons/Twitter";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import JobPostingIcon from "@material-ui/icons/Work";
import CustomCtaIcon from "@material-ui/icons/ControlPoint";
import {
   FACEBOOK_COLOR,
   LINKEDIN_COLOR,
   TWITTER_COLOR,
} from "../../../../../util/colors";

const useStyles = makeStyles((theme) => ({
   gridContainer: {},
   dialogContent: {
      padding: theme.spacing(0, 3, 3),
   },
}));

const useCtaCardStyles = makeStyles((theme) => ({
   cardRoot: {},
   media: {
      backgroundColor: (props) => alpha(props.color, 0.1),
      borderRadius: 5,
      height: 120,
      display: "grid",
      placeItems: "center",
      backgroundSize: "contain",
      maxWidth: "90%",
      marginTop: theme.spacing(2),
      "& svg": {
         fontSize: 100,
         color: (props) => props.color,
      },
   },
}));

const CallToActionTypeCard = ({ type, description, title, icon, color, handleSetCallToActionType }) => {
   const classes = useCtaCardStyles({ color });

   return (
      <Tooltip title={description}>
         <Card className={classes.cardRoot} align="center">
            <CardActionArea onClick={() => handleSetCallToActionType(type)}>
               <CardMedia
                  className={classes.media}
                  title="Contemplative Reptile"
               >
                  {icon}
               </CardMedia>
               <CardHeader title={title} />
            </CardActionArea>
         </Card>
      </Tooltip>
   );
};

const ctaTypes = [
   {
      icon: <LinkedInIcon />,
      color: LINKEDIN_COLOR,
      title: "Promote your LinkedIn",
      type: "linkedIn",
      description:
         "Help promote your LinkedIn page by sending a call to action to your live viewers.",
   },
   {
      icon: <FacebookIcon />,
      color: FACEBOOK_COLOR,
      title: "Promote your Facebook",
      type: "facebook",
      description:
         "Help promote your Facebook page by sending a call to action to your live viewers.",
   },
   {
      icon: <TwitterIcon />,
      color: TWITTER_COLOR,
      title: "Promote your Twitter",
      type: "twitter",
      description:
         "Help promote your Twitter page by sending a call to action to your live viewers.",
   },
   {
      icon: <JobPostingIcon />,
      color: "",
      title: "Promote a Job Posting",
      type: "jobPosting",
      description:
         "Help promote an open position to your live viewers with a link to the job posting.",
   },
   {
      icon: <CustomCtaIcon />,
      color: "primary",
      title: "Custom",
      type: "custom",
      description:
         "Create a custom call to action with a customized message, button text and link",
   },
];

const CallToActionTypeMenu = ({handleSetCallToActionType}) => {
   const classes = useStyles();
   const {
      palette: { grey, primary },
   } = useTheme();

   return (
      <React.Fragment>
         <DialogContent className={classes.dialogContent}>
            <Grid
               className={classes.gridContainer}
               container
               justifyContent="center"
               spacing={2}
            >
               {ctaTypes.map(({ type, description, title, icon, color }) => (
                  <Grid item xs={12} md={6} key={type} lg={4}>
                     <CallToActionTypeCard
                        {...{
                           type,
                           description,
                           handleSetCallToActionType,
                           title,
                           icon,
                           color:
                              color === "primary"
                                 ? primary.main
                                 : color || grey["500"],
                        }}
                     />
                  </Grid>
               ))}
            </Grid>
         </DialogContent>
      </React.Fragment>
   );
};

export default CallToActionTypeMenu;

CallToActionTypeMenu.propTypes = {
  handleSetCallToActionType: PropTypes.func.isRequired
}