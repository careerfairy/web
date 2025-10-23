import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { Box, Grid } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { SlideUpTransition } from "components/views/common/transitions"
import { groupRepo } from "data/RepositoryInstances"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useCallback, useEffect, useState } from "react"
import { Trash2 } from "react-feather"
import { errorLogAndNotify } from "util/CommonUtil"
import { useCompanyPage } from ".."
import { CreatorFormLayout } from "../MentorsSection/CreatorFormLayout"
import { MentorCard } from "../MentorsSection/MentorCard"
import { MentorForm } from "../MentorsSection/MentorForm"

const MentorsTab = () => {
   const { groupCreators, editMode, group } = useCompanyPage()

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const [isDeleteDialogOpen, handleOpenDeleteDialog, handleCloseDeleteDialog] =
      useDialogStateHandler()

   const [mentors, setMentors] = useState<PublicCreator[]>(groupCreators)

   const [selectedMentor, setSelectedMentor] = useState<PublicCreator | null>(
      null
   )

   const [mentorToDelete, setMentorToDelete] = useState<PublicCreator | null>(
      null
   )

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const [isDeleting, setIsDeleting] = useState(false)

   const handleSubmitCallback = useCallback((values) => {
      setMentors((prevMentors) => {
         const index = prevMentors.findIndex(
            (mentor) => mentor.id === values.id
         )
         if (index !== -1) {
            const updatedMentors = [...prevMentors]
            const oldMentor = prevMentors[index]
            const updatedMentor = {
               ...pickPublicDataFromCreator(values),
               groupId: oldMentor.groupId,
            }
            updatedMentors[index] = updatedMentor
            return updatedMentors
         }
         return [...prevMentors, values]
      })
   }, [])

   const handleOpen = useCallback(
      (creator: PublicCreator) => {
         setSelectedMentor(creator)
         handleOpenDialog()
      },
      [handleOpenDialog]
   )

   const handleClose = useCallback(() => {
      setSelectedMentor(null)
      handleCloseDialog()
   }, [handleCloseDialog])

   const handleDelete = useCallback(
      (mentor: PublicCreator) => {
         setMentorToDelete(mentor)
         handleOpenDeleteDialog()
      },
      [handleOpenDeleteDialog]
   )

   const handleConfirmDelete = useCallback(async () => {
      if (mentorToDelete && group?.id) {
         setIsDeleting(true)
         try {
            await groupRepo.removeCreatorFromGroup(group.id, mentorToDelete.id)
            setMentors((prevMentors) =>
               prevMentors.filter((mentor) => mentor.id !== mentorToDelete.id)
            )
            setMentorToDelete(null)
            handleCloseDeleteDialog()
            successNotification("Mentor deleted")
         } catch (error) {
            errorLogAndNotify(error, {
               mentorId: mentorToDelete?.id,
               groupId: group?.id,
            })
            errorNotification("Could not delete mentor, please try again later")
         } finally {
            setIsDeleting(false)
         }
      }
   }, [
      mentorToDelete,
      group?.id,
      handleCloseDeleteDialog,
      successNotification,
      errorNotification,
   ])

   const handleCancelDelete = useCallback(() => {
      setMentorToDelete(null)
      handleCloseDeleteDialog()
   }, [handleCloseDeleteDialog])

   useEffect(() => {
      if (editMode) {
         setMentors(groupCreators)
      }
   }, [editMode, groupCreators])

   return (
      <Box>
         <Grid container spacing={2}>
            {mentors?.map((mentor) => (
               <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={mentor.id}>
                  <MentorCard
                     creator={mentor}
                     isEditMode={editMode}
                     handleEdit={() => handleOpen(mentor)}
                     handleDelete={() => handleDelete(mentor)}
                  />
               </Grid>
            ))}
         </Grid>
         <CreatorFormLayout.Dialog
            isDialogOpen={isDialogOpen}
            handleCloseDialog={handleClose}
         >
            <MentorForm
               mentor={selectedMentor}
               handleSubmitCallback={handleSubmitCallback}
               handleClose={handleClose}
            />
         </CreatorFormLayout.Dialog>

         <ConfirmationDialog
            open={isDeleteDialogOpen}
            handleClose={handleCancelDelete}
            title="Delete this mentor?"
            description="This action is permanent. You will no longer be able to recover this mentor"
            icon={<Box component={Trash2} color="error.main" />}
            hideCloseIcon
            mobileButtonsHorizontal
            primaryAction={{
               text: "Delete",
               callback: handleConfirmDelete,
               color: "error",
               variant: "contained",
               loading: isDeleting,
               fullWidth: true,
            }}
            secondaryAction={{
               text: "Cancel",
               callback: handleCancelDelete,
               variant: "outlined",
               color: "grey",
               fullWidth: true,
            }}
            TransitionComponent={SlideUpTransition}
         />
      </Box>
   )
}

export default MentorsTab
