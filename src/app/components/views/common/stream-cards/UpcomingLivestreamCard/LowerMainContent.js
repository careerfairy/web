import React from "react";
import { Box, Grid } from "@mui/material";
import GroupLogoButton from "./GroupLogoButton";
import SpeakerInfo from "./SpeakerInfo";
import GroupsUtil from "../../../../../data/util/GroupsUtil";

const LowerMainContent = ({
   groups,
   livestream,
   handleOpenJoinModal,
   authenticatedUser,
   userData,
}) => {
   return (
      <>
         <Grid
            wrap="nowrap"
            spacing={2}
            justifyContent={groups.length === 1 ? "center" : "space-evenly"}
            container
         >
            {groups.map((group) => {
               const following = GroupsUtil.checkIfUserFollows(
                  { authenticatedUser, userData },
                  group
               );
               return (
                  <Grid xs={"auto"} item key={group.id}>
                     <GroupLogoButton
                        handleFollow={
                           following
                              ? null
                              : () =>
                                   handleOpenJoinModal({
                                      groups: [group],
                                      livestream,
                                   })
                        }
                        group={group}
                     />
                  </Grid>
               );
            })}
         </Grid>
         <Box mt={1}>
            {livestream.speakers.map((speaker) => (
               <SpeakerInfo key={speaker.id} speaker={speaker} />
            ))}
         </Box>
      </>
   );
};

export default LowerMainContent;
