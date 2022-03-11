import { useSnackbar } from "notistack";
import { useAuth } from "../../../HOCs/AuthProvider";
import {
   makeLivestreamEventDetailsInviteUrl,
   makeLivestreamEventDetailsUrl,
} from "../../../util/makeUrls";
import { copyStringToClipboard } from "../../helperFunctions/HelperFunctions";
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   TextField,
   Typography,
} from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import React from "react";
import { getPoints, RewardActions } from "../../../../shared/rewards";
import { streamIsOld } from "../../../util/CommonUtil";

const ShareLivestreamModal = ({ livestreamData, handleClose }) => {
   const { enqueueSnackbar } = useSnackbar();
   const { userData } = useAuth();

   const copyReferralLinkToClipboard = () => {
      copyStringToClipboard(link);
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "success",
         preventDuplicate: true,
      });
      handleClose();
   };

   let link = makeLivestreamEventDetailsUrl(livestreamData.id);
   const isReferralLink = userData && !streamIsOld(livestreamData.start);
   if (isReferralLink) {
      link = makeLivestreamEventDetailsInviteUrl(
         livestreamData.id,
         userData.referralCode
      );
   } else {
      copyReferralLinkToClipboard();
      return <div />;
   }

   return (
      <Dialog
         maxWidth="md"
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={true}
         onClose={handleClose}
      >
         <DialogTitle>Share Event: {livestreamData.title}</DialogTitle>
         <DialogContent dividers>
            {isReferralLink ? (
               <Typography variant="body2" my={1}>
                  Earn{" "}
                  {getPoints(RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER)}{" "}
                  points for each friend who attends this event with your link.
                  You can trade your points for awesome rewards.
               </Typography>
            ) : (
               ""
            )}

            <Typography variant="h6" my={2}>
               {isReferralLink ? "Your Referral Link:" : "Link:"}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
               <TextField
                  sx={{ flex: 1, marginRight: "10px" }}
                  variant="outlined"
                  value={link}
                  disabled
               />
               <Button
                  variant="contained"
                  sx={{ boxShadow: "none" }}
                  startIcon={<ContentPasteIcon />}
                  onClick={copyReferralLinkToClipboard}
               >
                  Copy
               </Button>
            </Box>
         </DialogContent>
         <DialogActions sx={{ justifyContent: "center" }}>
            <Button variant="outlined" onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   );
};

export default ShareLivestreamModal;
