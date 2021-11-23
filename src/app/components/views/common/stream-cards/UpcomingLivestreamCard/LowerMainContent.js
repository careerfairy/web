import React from "react";
import { Box, Grid } from "@material-ui/core";
import GroupLogoButton from "./GroupLogoButton";
import SpeakerInfo from "./SpeakerInfo";

const LowerMainContent = ({ groups, livestream }) => {
   return (
      <>
         <Grid
            wrap="nowrap"
            spacing={2}
            justifyContent={groups.length === 1 ? "center" : "space-evenly"}
            container
         >
            {groups.map((group) => (
               <Grid xs={"auto"} item key={group.id}>
                  <GroupLogoButton handleFollow={() => {}} group={group} />
               </Grid>
            ))}
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
