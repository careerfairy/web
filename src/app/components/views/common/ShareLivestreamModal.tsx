import { useSnackbar } from "notistack";
import { useAuth } from "../../../HOCs/AuthProvider";
import {
   makeLivestreamEventDetailsInviteUrl,
   makeLivestreamEventDetailsUrl,
} from "../../../util/makeUrls";
import {
   copyStringToClipboard,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions";
import {
   Avatar,
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   Stack,
   TextField,
   Typography,
} from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import React, { useEffect, useState } from "react";
import { streamIsOld } from "../../../util/CommonUtil";

const styles = {
   title: {
      textTransform: "uppercase",
      fontWeight: "800",
   },
   body2: {
      fontSize: "1rem",
      mb: 3,
   },
   stack: {
      mt: 6,
      mb: 6,
   },
   imageBox: {
      p: 0,
      "& img": {
         height: 50,
      },
   },
   titleBox: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      "& p": {
         fontWeight: "800",
      },
   },
};

const ShareLivestreamModal = ({ livestreamData, handleClose }) => {
   const { enqueueSnackbar } = useSnackbar();
   const { userData } = useAuth();
   const [referralLink, setReferralLink] = useState(null);

   const copyReferralLinkToClipboard = (link) => {
      copyStringToClipboard(link);
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "success",
         preventDuplicate: true,
      });
   };

   useEffect(() => {
      const isReferralLink = userData && !streamIsOld(livestreamData.start);
      if (isReferralLink) {
         setReferralLink(
            makeLivestreamEventDetailsInviteUrl(
               livestreamData.id,
               userData.referralCode
            )
         );
      } else {
         copyReferralLinkToClipboard(
            makeLivestreamEventDetailsUrl(livestreamData.id)
         );
      }
   }, [livestreamData.id, livestreamData.start, userData]);

   if (!referralLink) return "";

   return (
      <Dialog
         maxWidth="md"
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={true}
         onClose={handleClose}
      >
         <DialogTitle>
            <Typography sx={styles.title}>Share Event</Typography>
         </DialogTitle>
         <DialogContent dividers>
            <Typography sx={styles.body2} variant="body2" my={1}>
               Share this event with friends who need to see this!
            </Typography>
            <Box>
               <Stack sx={styles.stack} spacing={4} direction="row">
                  <Box sx={styles.imageBox}>
                     <img
                        src={getResizedUrl(livestreamData.companyLogoUrl)}
                        alt={livestreamData.company}
                     />
                  </Box>
                  <Box sx={styles.titleBox}>
                     <Typography>{livestreamData.title}</Typography>
                  </Box>
               </Stack>
            </Box>
            <Typography variant="h6" my={2}>
               Your Personal Referral Link:
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
               <TextField
                  sx={{ flex: 1, marginRight: "10px" }}
                  variant="outlined"
                  value={referralLink}
                  disabled
               />
               <Button
                  variant="contained"
                  sx={{ boxShadow: "none" }}
                  startIcon={<ContentPasteIcon />}
                  onClick={() => copyReferralLinkToClipboard(referralLink)}
               >
                  Copy
               </Button>
            </Box>
         </DialogContent>
         <DialogActions sx={{ justifyContent: "right" }}>
            <Button variant="outlined" onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   );
};

export default ShareLivestreamModal;
