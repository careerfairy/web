import React from "react";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import { Chip } from "@mui/material";

const styles = {
   warningChip: {
      backgroundColor: (theme) => theme.palette.warning.main,
      color: (theme) => theme.palette.common.white,
   },
   badgeWhite: {
      color: (theme) => theme.palette.common.white,
      borderColor: (theme) => theme.palette.common.white,
      backgroundColor: "transparent",
   },
};

export const LimitedRegistrationsBadge = ({
   numberOfSpotsRemaining,
   white,
}) => {
   const MIN_NUMBER_OF_DISPLAYED_SPOTS = 10;
   return (
      <Chip
         icon={<WhatshotIcon style={{ color: "white" }} />}
         sx={[styles.warningChip, white && styles.badgeWhite]}
         variant={white && "outlined"}
         label={
            numberOfSpotsRemaining < MIN_NUMBER_OF_DISPLAYED_SPOTS
               ? `${numberOfSpotsRemaining} spots left`
               : "Limited spots!"
         }
      />
   );
};

export const InPersonEventBadge = ({ white }) => {
   return (
      <Chip
         icon={<EmojiPeopleIcon style={{ color: "white" }} />}
         label="In-Person Event"
         sx={[white && styles.badgeWhite]}
         variant={white && "outlined"}
         color="secondary"
      />
   );
};
