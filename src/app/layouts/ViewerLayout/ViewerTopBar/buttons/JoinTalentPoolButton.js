import React from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import { useCurrentStream } from "../../../../context/stream/StreamContext";
import useJoinTalentPool from "../../../../components/custom-hook/useJoinTalentPool";

const JoinTalentPoolButton = ({ mobile }) => {
   const { currentLivestream } = useCurrentStream();

   const {
      userIsInTalentPool,
      handlers: { joinTalentPool, leaveTalentPool },
   } = useJoinTalentPool();

   if (currentLivestream?.hasNoTalentPool) return null;

   if (mobile) {
      return (
         <Tooltip
            title={`Press to ${
               userIsInTalentPool ? "leave" : "join"
            } the talent poll`}
         >
            <IconButton
               color="primary"
               onClick={
                  userIsInTalentPool
                     ? () => leaveTalentPool()
                     : () => joinTalentPool()
               }
               size="large">
               {userIsInTalentPool ? (
                  <HowToRegRoundedIcon />
               ) : (
                  <HowToRegOutlinedIcon />
               )}
            </IconButton>
         </Tooltip>
      );
   }

   return (
      <Button
         children={
            userIsInTalentPool ? "Leave Talent Pool" : "Join Talent Pool"
         }
         variant="contained"
         startIcon={<HowToRegRoundedIcon />}
         icon={userIsInTalentPool ? "delete" : "handshake outline"}
         onClick={
            userIsInTalentPool
               ? () => leaveTalentPool()
               : () => joinTalentPool()
         }
         color={userIsInTalentPool ? "default" : "primary"}
      />
   );
};

export default JoinTalentPoolButton;
