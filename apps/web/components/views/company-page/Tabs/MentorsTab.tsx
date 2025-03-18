import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { Box, Grid } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useCallback, useEffect, useState } from "react"
import { useCompanyPage } from ".."
import { CreatorFormLayout } from "../MentorsSection/CreatorFormLayout"
import { MentorCard } from "../MentorsSection/MentorCard"
import { MentorForm } from "../MentorsSection/MentorForm"

const MentorsTab = () => {
   const { groupCreators, editMode } = useCompanyPage()

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const [mentors, setMentors] = useState<PublicCreator[]>(groupCreators)

   const [selectedMentor, setSelectedMentor] = useState<PublicCreator | null>(
      null
   )

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
      </Box>
   )
}

export default MentorsTab
