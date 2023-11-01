import React from "react"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import CheckIcon from "@mui/icons-material/Check"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import {
   DialogContentText,
   DialogTitle,
   Typography,
   Slide,
   DialogContent as MuiDialogContent,
   DialogActions as MuiDialogActions,
   TextField,
   Button,
} from "@mui/material"
import { GlassDialog } from "../../../../materialUI/GlobalModals"
import useStreamActiveHandRaises from "../../../custom-hook/useStreamActiveHandRaises"

function SpeakerManagementModal({ open, setOpen, joiningStreamerLink }) {
   const { maxHandRaisers } = useStreamActiveHandRaises()
   return (
      <GlassDialog
         TransitionComponent={Slide}
         fullWidth
         onClose={() => setOpen(false)}
         open={open}
      >
         <DialogTitle
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "flex-end",
            }}
            align="center"
         >
            <PersonAddIcon style={{ marginRight: "1rem" }} fontSize="large" />{" "}
            <Typography
               style={{ fontSize: "1.8em", fontWeight: 500 }}
               variant="h3"
            >
               Invite additional speakers
            </Typography>
         </DialogTitle>
         <MuiDialogContent dividers>
            <DialogContentText>
               You can invite up to {maxHandRaisers} speakers to join your
               stream. You should do this before starting your stream, to ensure
               that all streamer have joined before the event starts. When an
               invited speaker has successfully joined, you will be able to see
               and hear him/her in the stream overview.
            </DialogContentText>
            <TextField
               variant="outlined"
               fullWidth
               sx={{ mt: 2 }}
               autoFocus
               InputProps={{ readOnly: true }}
               value={joiningStreamerLink}
            />
         </MuiDialogContent>
         <MuiDialogActions>
            <Button
               variant="contained"
               color="primary"
               startIcon={<CheckIcon />}
               onClick={() => setOpen(false)}
            >
               OK
            </Button>
         </MuiDialogActions>
      </GlassDialog>
   )
}

export default withFirebase(SpeakerManagementModal)
