import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import JobPostingIcon from "@mui/icons-material/Work";
import CustomIcon from "@mui/icons-material/Info";
import React from "react";
import { FACEBOOK_COLOR, LINKEDIN_COLOR, TWITTER_COLOR } from "../colors";
import { brandedLightTheme } from "../../../materialUI";
import { makeExternalLink } from "../../helperFunctions/HelperFunctions";

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
      color: brandedLightTheme.palette.primary.main,
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

export const getCtaSnackBarProps = (callToAction, fallBackImage) => {
   let cta = callToAction;

   let message = cta.message || "";
   const type = cta.type;
   const socialType = cta.socialData?.socialType || "";
   if (type === "social") {
      const socialName = callToActionsSocialsDictionary[socialType].name;
      message = socialName ? `Follow us on ${socialName}` : "Follow us";
   }
   const buttonText = cta.buttonText || "Click here";
   const buttonUrl = cta.buttonUrl
      ? makeExternalLink(cta.buttonUrl)
      : "https://careerfairy.io/";
   const callToActionId = cta.id;

   const jobTitle = cta.jobData?.jobTitle || "";
   const salary = cta.jobData?.salary || "";
   const applicationDeadline =
      cta.jobData?.applicationDeadline?.toDate?.() || null;
   const snackBarImage = cta.imageUrl || fallBackImage;
   let icon = callToActionsDictionary.custom.icon;
   const socialIcon = callToActionsSocialsDictionary?.[socialType]?.icon;
   const baseIcon = callToActionsDictionary[type]?.icon;
   if (type === "social" && socialIcon) {
      icon = socialIcon;
   } else if (baseIcon) {
      icon = baseIcon;
   }
   return {
      buttonText,
      buttonUrl,
      isForTutorial: Boolean(cta.isForTutorial),
      isJobPosting: type === "jobPosting",
      message,
      icon,
      callToActionId,
      jobTitle,
      salary,
      applicationDeadline,
      snackBarImage,
      type,
      id: callToActionId,
   };
};
