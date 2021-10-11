import React from "react";
import { Button, IconButton, Tooltip } from "@material-ui/core";
import HowToRegRoundedIcon from "@material-ui/icons/HowToRegRounded";
import HowToRegOutlinedIcon from "@material-ui/icons/HowToRegOutlined";
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
            >
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
