import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import WhatshotIcon from "@material-ui/icons/Whatshot";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import { Chip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   warningChip: {
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.common.white,
   },
}));

export const LimitedRegistrationsBadge = ({ numberOfSpotsRemaining }) => {
   const classes = useStyles();
   const MIN_NUMBER_OF_DISPLAYED_SPOTS = 10;
   return (
      <Chip
         icon={<WhatshotIcon style={{ color: "white" }} />}
         className={classes.warningChip}
         label={
            numberOfSpotsRemaining < MIN_NUMBER_OF_DISPLAYED_SPOTS
               ? `${numberOfSpotsRemaining} spots left`
               : "Limited spots!"
         }
      />
   );
};

export const InPersonEventBadge = ({ numberOfSpotsRemaining }) => {
   return (
      <Chip
         icon={<EmojiPeopleIcon style={{ color: "white" }} />}
         label="In-Person Event"
         color="secondary"
      />
   );
};
