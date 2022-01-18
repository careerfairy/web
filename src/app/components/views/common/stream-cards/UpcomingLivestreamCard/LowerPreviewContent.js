import React from "react";
import { Box } from "@mui/material";
import StreamAvatarGroup from "./StreamAvatarGroup";
import makeStyles from '@mui/styles/makeStyles';

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
