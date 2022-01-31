import React from "react";
import { Avatar, AvatarGroup, Box, Typography } from "@mui/material";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";
import { speakerPlaceholder } from "../../../util/constants";

const styles = {
   avatar: (theme) => ({
      [theme.breakpoints.up("sm")]: {
         width: theme.spacing(8),
         height: theme.spacing(8),
      },
   }),
   speakerRoot: {
      display: "flex",
      alignItems: "center",
   },
   speakerAva: (theme) => ({
      boxShadow: theme.shadows[3],
      [theme.breakpoints.up("sm")]: {
         width: theme.spacing(10),
         height: theme.spacing(10),
      },
   }),
   speakerInfo: {
      padding: (theme) => theme.spacing(0, 2),
   },
};

const HeroSpeakers = ({ speakers }) => {
   return speakers.length === 1 ? (
      <Box sx={styles.speakerRoot}>
         <Avatar
            title={`${speakers[0].firstName || ""} ${
               speakers[0].lastName || ""
            }`}
            sx={styles.speakerAva}
            src={
               speakers[0].avatar
                  ? getResizedUrl(speakers[0].avatar, "sm")
                  : speakerPlaceholder
            }
         />
         <Box sx={styles.speakerInfo}>
            <Typography variant="body1">
               {speakers[0].firstName + " " + speakers[0].lastName}
            </Typography>
            <Typography variant="body2">
               {`${speakers[0].position} ${speakers[0].background}`}
            </Typography>
         </Box>
      </Box>
   ) : (
      <AvatarGroup>
         {speakers.map((speaker) => (
            <Avatar
               sx={styles.avatar}
               key={speaker.id}
               src={
                  speaker.avatar
                     ? getResizedUrl(speaker.avatar, "xs")
                     : speakerPlaceholder
               }
               title={`${speaker.firstName || ""} ${speaker.lastName || ""}`}
            />
         ))}
      </AvatarGroup>
   );
};

export default HeroSpeakers;
