import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import JobPostingIcon from "@material-ui/icons/Work";
import CustomIcon from "@material-ui/icons/Info";
import React from "react";
import { FACEBOOK_COLOR, LINKEDIN_COLOR, TWITTER_COLOR } from "../colors";
import { baseThemeObj } from "../../../materialUI";

export const callToActionsIconsDictionary = {
   linkedIn: {
      icon: <LinkedInIcon />,
      color: LINKEDIN_COLOR,
   },
   facebook: {
      icon: <FacebookIcon />,
      color: FACEBOOK_COLOR,
   },
   twitter: {
      icon: <TwitterIcon />,
      color: TWITTER_COLOR,
   },
   jobPosting: {
      icon: <JobPostingIcon />,
      color: "#9e9e9e",
   },
   custom: {
      icon: <CustomIcon />,
      color: baseThemeObj.palette.primary.main,
   },
};
