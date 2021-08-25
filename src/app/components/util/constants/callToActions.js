import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import JobPostingIcon from "@material-ui/icons/Work";
import CustomIcon from "@material-ui/icons/Info";
import React from "react";
import { FACEBOOK_COLOR, LINKEDIN_COLOR, TWITTER_COLOR } from "../colors";
import { baseThemeObj } from "../../../materialUI";

export const defaultDeadlineDate = new Date(
   new Date().getTime() + 7 * 24 * 60 * 60 * 1000
);

export const callToActionsDictionary = {
   social: {
      icon: <LinkedInIcon />,
      color: LINKEDIN_COLOR,
      title: "Social",
      type: "social",
      description:
         "Help promote your social media page by sending a call to action to your live viewers.",
      buttonText: "Follow now",
      message: "Follow us",
      socialTypes: {
         linkedIn: {
            icon: <LinkedInIcon />,
            name: "LinkedIn",
            color: LINKEDIN_COLOR,
            socialType: "linkedIn",
         },
         facebook: {
            icon: <FacebookIcon />,
            name: "Facebook",
            color: FACEBOOK_COLOR,
            socialType: "facebook",
         },
         twitter: {
            icon: <TwitterIcon />,
            name: "Twitter",
            color: TWITTER_COLOR,
            socialType: "twitter",
         },
      },
      value: 0,
   },
   jobPosting: {
      icon: <JobPostingIcon />,
      color: "#9e9e9e",
      title: "Job posting",
      type: "jobPosting",
      description:
         "Help promote an open position to your live viewers with a link to the job posting.",
      buttonText: "Apply now",
      message: "Open position",
      value: 1,
   },
   custom: {
      icon: <CustomIcon />,
      color: baseThemeObj.palette.primary.main,
      title: "Custom message",
      type: "custom",
      description:
         "Create a custom call to action with a customized message, button text and link",
      buttonText: "Click here",
      message: "",
      value: 2,
   },
};

export const callToActionsArray = Object.keys(callToActionsDictionary).map(
   (key) => callToActionsDictionary[key]
);
export const callToActionsSocialsDictionary =
   callToActionsDictionary.social.socialTypes;

export const callToActionSocialsArray = Object.keys(
   callToActionsSocialsDictionary
).map((key) => callToActionsSocialsDictionary[key]);
