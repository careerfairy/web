import React from "react";
import { makeStyles } from "@material-ui/core/styles";
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
import { FACEBOOK_COLOR, LINKEDIN_COLOR, TWITTER_COLOR } from "../../../../../util/colors";

const useStyles = makeStyles((theme) => ({
   gridContainer: {},
   dialogContent: {
      padding: theme.spacing(0, 3, 3),
   },
}));

const useCtaCardStyles = makeStyles((theme) => ({
   media: {
      height: 120,
      display: "grid",
      placeItems:"center",
      backgroundSize: "contain",
      maxWidth: "90%",
      marginTop: theme.spacing(2),
      '& svg': {
         fontSize: 100
      }
   },
}));

const CallToActionTypeCard = ({ type, description, title, icon }) => {
   const classes = useCtaCardStyles();

   return (
      <Tooltip title={description}>
         <Card align="center">
            <CardActionArea>
               <CardMedia
                  className={classes.media}
                  title="Contemplative Reptile"
               >
                  {icon}
               </CardMedia>
               <CardHeader title={title} />
               {/*<CardContent>*/}
               {/*   <Typography variant="body1">{description}</Typography>*/}
               {/*</CardContent>*/}
            </CardActionArea>
         </Card>
      </Tooltip>
   );
};

const ctaTypes = [
   {
      icon: <LinkedInIcon />,
      color: LINKEDIN_COLOR,
      title: "Promote your linkedIn",
      type: "linkedIn",
      description:
         "Help promote your linkedIn page by sending a call to action to your live viewers.",
   },
   {
      icon: <FacebookIcon />,
      color: FACEBOOK_COLOR,
      title: "Promote your Facebook",
      type: "facebook",
      description:
         "Help promote your facebook page by sending a call to action to your live viewers.",
   },
   {
      icon: <TwitterIcon />,
      color: TWITTER_COLOR,
      title: "Promote your Twitter",
      type: "twitter",
      description:
         "Help promote your twitter page by sending a call to action to your live viewers.",
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
      icon: <CustomCtaIcon style={{color: LINKEDIN_COLOR}} />,
      color: "",
      title: "Custom",
      type: "custom",
      description:
         "Create a custom call to action with a customized message, button text and link",
   },
];

const CallToActionTypeMenu = ({}) => {
   const classes = useStyles();

   return (
      <React.Fragment>
         <DialogContent className={classes.dialogContent}>
            <Grid className={classes.gridContainer} container spacing={2}>
               {ctaTypes.map(({ type, description, title, icon }) => (
                  <Grid item xs={12} md={6} key={type} lg={4}>
                     <CallToActionTypeCard
                        {...{ type, description, title, icon }}
                     />
                  </Grid>
               ))}
            </Grid>
         </DialogContent>
      </React.Fragment>
   );
};

export default CallToActionTypeMenu;
