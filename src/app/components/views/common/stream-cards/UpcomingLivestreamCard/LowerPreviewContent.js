import React from "react";
import { Box } from "@material-ui/core";
import StreamAvatarGroup from "./StreamAvatarGroup";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
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
}));
const LowerPreviewContent = ({ groups, speakers }) => {
   const classes = useStyles();
   return (
      <Box className={classes.lowerMiniWrapper}>
         <Box className={classes.miniSpeakersWrapper}>
            <StreamAvatarGroup avatars={speakers} max={3} />
         </Box>
         {!!groups.length && (
            <Box className={classes.miniGroupsWrapper}>
               <StreamAvatarGroup isLogo avatars={groups} max={5} />
            </Box>
         )}
      </Box>
   );
};

export default LowerPreviewContent;
