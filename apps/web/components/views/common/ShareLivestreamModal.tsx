import { useSnackbar } from "notistack"
import { useAuth } from "../../../HOCs/AuthProvider"
import { makeLivestreamEventDetailsInviteUrl } from "../../../util/makeUrls"
import {
   copyStringToClipboard,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"
import {
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
} from "@mui/material"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import React, { useEffect, useState } from "react"
import { streamIsOld } from "../../../util/CommonUtil"
import ReferralPrompt from "./ReferralPrompt"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/src/utils/urls"

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
      // mt: 6,
      // mb: 6,
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
} as const

const ShareLivestreamModal = ({ livestreamData, handleClose }) => {
   const { enqueueSnackbar } = useSnackbar()
   const { userData } = useAuth()
   const [referralLink, setReferralLink] = useState(null)

   const copyReferralLinkToClipboard = (link) => {
      copyStringToClipboard(link)
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "success",
         preventDuplicate: true,
      })
      dataLayerEvent("event_share", {
         medium: "Copy Link",
      })
   }

   useEffect(() => {
      const isReferralLink = userData && !streamIsOld(livestreamData.start)
      if (isReferralLink) {
         setReferralLink(
            makeLivestreamEventDetailsInviteUrl(
               livestreamData.id,
               userData.referralCode
            )
         )
      } else {
         copyReferralLinkToClipboard(
            makeLivestreamEventDetailsUrl(livestreamData.id)
         )
      }
   }, [livestreamData.id, livestreamData.start, userData])

   if (!referralLink) return null

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
            <Stack spacing={2}>
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
               <ReferralPrompt event={livestreamData} />
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
            </Stack>
         </DialogContent>
         <DialogActions sx={{ justifyContent: "right" }}>
            <Button variant="outlined" onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default ShareLivestreamModal
