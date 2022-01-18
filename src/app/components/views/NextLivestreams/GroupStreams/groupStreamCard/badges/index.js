import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import WhatshotIcon from "@mui/icons-material/Whatshot";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import { Chip } from "@mui/material";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   warningChip: {
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.common.white,
   },
   badgeWhite: {
      color: theme.palette.common.white,
      borderColor: theme.palette.common.white,
      backgroundColor: "transparent",
   },
}));

export const LimitedRegistrationsBadge = ({
   numberOfSpotsRemaining,
   white,
}) => {
   const classes = useStyles();
   const MIN_NUMBER_OF_DISPLAYED_SPOTS = 10;
   return (
      <Chip
         icon={<WhatshotIcon style={{ color: "white" }} />}
         className={clsx(classes.warningChip, {
            [classes.badgeWhite]: white,
         })}
         variant={white && "outlined"}
         label={
            numberOfSpotsRemaining < MIN_NUMBER_OF_DISPLAYED_SPOTS
               ? `${numberOfSpotsRemaining} spots left`
               : "Limited spots!"
         }
      />
   );
};

export const InPersonEventBadge = ({ numberOfSpotsRemaining, white }) => {
   const classes = useStyles();
   return (
      <Chip
         icon={<EmojiPeopleIcon style={{ color: "white" }} />}
         label="In-Person Event"
         className={clsx({
            [classes.badgeWhite]: white,
         })}
         variant={white && "outlined"}
         color="secondary"
      />
   );
};
