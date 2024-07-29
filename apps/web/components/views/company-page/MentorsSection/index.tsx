import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { Box, Typography } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ContentCarousel } from "components/views/mentor-page/ContentCarousel"
import { useCallback, useEffect, useState } from "react"
import { useMountedState } from "react-use"
import { useCompanyPage } from ".."
import { CreatorFormLayout } from "./CreatorFormLayout"
import { MentorCard } from "./MentorCard"
import { MentorForm } from "./MentorForm"

export const MentorsSection = () => {
   const isMobile = useIsMobile()

   const { editMode, groupCreators } = useCompanyPage()
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const isMounted = useMountedState()

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

   if (!groupCreators?.length) return null

   if (!isMounted()) return null

   return (
      <Box>
         <ContentCarousel
            slideWidth={MentorCard.width}
            headerTitle={
               <Typography variant="h4" fontWeight={"600"} color="black" mb={1}>
                  Mentors
               </Typography>
            }
            viewportSx={{
               // hack to ensure shadows are not cut off
               padding: "16px",
               margin: "-16px",
               width: "calc(100% + 16px)",
            }}
         >
            {mentors.map((creator) => (
               <MentorCard
                  key={`mentor-slide-box-${JSON.stringify(creator)}`}
                  creator={creator}
                  isEditMode={editMode}
                  handleEdit={() => handleOpen(creator)}
               />
            ))}
         </ContentCarousel>
         <CreatorFormLayout.Dialog
            isDialogOpen={isDialogOpen}
            isMobile={isMobile}
            handleCloseDialog={handleClose}
         >
            <Box
               key={`mentor-form-${selectedMentor?.id}`}
               sx={{ display: "contents" }}
            >
               <MentorForm
                  mentor={selectedMentor}
                  handleSubmitCallback={handleSubmitCallback}
                  handleClose={handleClose}
               />
            </Box>
         </CreatorFormLayout.Dialog>
      </Box>
   )
}
