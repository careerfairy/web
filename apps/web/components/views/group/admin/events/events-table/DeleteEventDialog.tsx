import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   Stack,
} from "@mui/material"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import DeleteLinkedContentDialog from "components/views/common/DeleteLinkedContentDialog"
import AreYouSureModal from "materialUI/GlobalModals/AreYouSureModal"
import React from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 4,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   actions: {
      justifyContent: "space-evenly",
      px: 4,
      py: 3,
   },
   cancelBtn: {
      color: "grey",
   },
   actionBtn: {
      width: "160px",
   },
})

type Props = {
   groupId: string
   livestreamId: string
   handleClose: () => void
   handleConfirm: () => void
   loading: boolean
   message: string
}

const DeleteEventDialog: React.FC<Props> = ({
   groupId,
   livestreamId,
   handleClose,
   handleConfirm,
   loading,
   message,
}) => {
   const linkedJobs = useGroupCustomJobs(groupId, { livestreamId })

   if (!linkedJobs?.length) {
      return (
         <AreYouSureModal
            open={true}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            loading={loading}
            message={message}
         />
      )
   }

   return (
      <Dialog open={true} onClose={handleClose} maxWidth="xs">
         <DialogContent sx={styles.container}>
            <Stack spacing={3} sx={styles.info}>
               <DeleteLinkedContentDialog
                  linkedJobs={linkedJobs}
                  contentType="livestream"
               />
            </Stack>
         </DialogContent>

         <DialogActions sx={styles.actions}>
            <Button
               variant="outlined"
               color="grey"
               onClick={handleClose}
               sx={[styles.cancelBtn, styles.actionBtn]}
            >
               Cancel
            </Button>

            <Button
               color="error"
               disabled={loading}
               onClick={handleConfirm}
               variant="contained"
               sx={styles.actionBtn}
            >
               Delete
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default DeleteEventDialog
