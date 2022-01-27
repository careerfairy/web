import React from "react";
import { Box } from "@mui/material";
import StreamAvatarGroup from "./StreamAvatarGroup";

const styles = {
   lowerMiniWrapper: {
      display: "flex",
      width: "100%",
   },
   miniSpeakersWrapper: {
      display: "flex",
      flexWrap: "nowrap",
      width: "40%",
   },

   miniGroupsWrapper: {
      display: "flex",
      flexWrap: "nowrap",
      width: "60%",
      justifyContent: "center",
   },
};

const LowerPreviewContent = ({ groups, speakers }) => {
   return (
      <Box sx={styles.lowerMiniWrapper}>
         <Box sx={styles.miniSpeakersWrapper}>
            <StreamAvatarGroup avatars={speakers} max={3} />
         </Box>
         {!!groups.length && (
            <Box sx={styles.miniGroupsWrapper}>
               <StreamAvatarGroup isLogo avatars={groups} max={5} />
            </Box>
         )}
      </Box>
   );
};

export default LowerPreviewContent;
