import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   CreatorRoles,
   PublicCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { LoadingButton } from "@mui/lab"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   Drawer,
   Stack,
} from "@mui/material"
import Box from "@mui/material/Box"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import DeleteLinkedContentDialog from "components/views/common/DeleteLinkedContentDialog"
import { groupRepo } from "data/RepositoryInstances"
import { sparkService } from "data/firebase/SparksService"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { FC, useMemo, useState } from "react"
import { Trash2 as DeleteIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   deleteIcon: {
      "& svg": {
         fontSize: 60,
         color: "error.main",
      },
   },
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
   paperRoot: {
      borderRadius: (theme) => theme.spacing(2, 2, 0, 0),
   },
})

type Props = {
   sparkId: string
   groupId: string
   creator: PublicCreator
   open: boolean
   handleClose: () => void
   onDeleted: () => void
}

const ConfirmDeleteSparkDialog: FC<Props> = ({
   sparkId,
   groupId,
   creator,
   handleClose,
   onDeleted,
   open,
}) => {
   if (!open) {
      return null
   }

   return (
      <SuspenseWithBoundary fallback={<></>}>
         <DeleteSparkContent
            sparkId={sparkId}
            groupId={groupId}
            creator={creator}
            open={open}
            handleClose={handleClose}
            onDeleted={onDeleted}
         />
      </SuspenseWithBoundary>
   )
}

const DeleteSparkContent: FC<Props> = ({
   sparkId,
   groupId,
   creator,
   handleClose,
   onDeleted,
   open,
}) => {
   const [isDeletingSpark, setIsDeletingSpark] = useState(false)
   const { errorNotification } = useSnackbarNotifications()
   const linkedJobs = useGroupCustomJobs(groupId, { sparkId })
   const isMobile = useIsMobile()

   // Define primary action for the confirmation dialog
   const primaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: async () => {
            // Delete Spark
            setIsDeletingSpark(true)
            try {
               await sparkService.deleteSpark({
                  id: sparkId,
                  groupId,
               })

               const creatorSparks = await sparkService.getCreatorSparks(
                  creator.id,
                  groupId
               )

               const udpatedCreatorSparks = creatorSparks.filter(
                  (spark) => spark.id !== sparkId
               )

               if (udpatedCreatorSparks.length === 0) {
                  await groupRepo.updateCreatorRolesInGroup(
                     groupId,
                     creator.id,
                     creator.roles.filter((role) => role !== CreatorRoles.Spark)
                  )
               }

               onDeleted()
            } catch (error) {
               errorNotification(error, "Error deleting Spark", {
                  sparkId,
                  groupId,
               })
            } finally {
               setIsDeletingSpark(false)
               handleClose()
            }
         },
         text: "Delete",
         color: "error",
         variant: "contained",
         loading: isDeletingSpark,
      }),
      [
         creator.id,
         creator.roles,
         errorNotification,
         groupId,
         handleClose,
         isDeletingSpark,
         onDeleted,
         sparkId,
      ]
   )

   // Define secondary action for the confirmation dialog
   const secondaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            handleClose()
         },
         text: "Cancel",
         color: "grey",
         variant: "outlined",
      }),
      [handleClose]
   )

   // If the spark is not linked to any custom jobs, display a confirmation dialog
   if (!linkedJobs?.length) {
      return (
         <ConfirmationDialog
            open={open}
            handleClose={handleClose}
            icon={
               <Box sx={styles.deleteIcon}>
                  <DeleteIcon />
               </Box>
            }
            title="Delete Spark"
            description={
               <>
                  Are you sure you want to delete this Spark?
                  <br />
                  This action cannot be undone.
               </>
            }
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
         />
      )
   }

   if (isMobile) {
      return (
         <Drawer
            open={open}
            anchor="bottom"
            PaperProps={{
               sx: styles.paperRoot,
            }}
         >
            <Content
               linkedJobs={linkedJobs}
               handleClose={handleClose}
               isDeletingSpark={isDeletingSpark}
               primaryAction={primaryAction}
            />
         </Drawer>
      )
   }

   // If the spark is linked to custom jobs, display a dialog with a DeleteLinkedContentDialog
   return (
      <Dialog open={open} onClose={handleClose} maxWidth="xs">
         <Content
            linkedJobs={linkedJobs}
            handleClose={handleClose}
            isDeletingSpark={isDeletingSpark}
            primaryAction={primaryAction}
         />
      </Dialog>
   )
}

type ContentProps = {
   linkedJobs: CustomJob[]
   handleClose: () => void
   isDeletingSpark: boolean
   primaryAction: any
}

const Content: FC<ContentProps> = ({
   linkedJobs,
   handleClose,
   isDeletingSpark,
   primaryAction,
}) => (
   <>
      <DialogContent sx={styles.container}>
         <Stack spacing={3} sx={styles.info}>
            <DeleteLinkedContentDialog
               linkedJobs={linkedJobs}
               contentType="spark"
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

         <LoadingButton
            color="error"
            disabled={isDeletingSpark}
            loading={isDeletingSpark}
            onClick={() => primaryAction.callback()}
            variant="contained"
            sx={styles.actionBtn}
         >
            Delete
         </LoadingButton>
      </DialogActions>
   </>
)
export default ConfirmDeleteSparkDialog
