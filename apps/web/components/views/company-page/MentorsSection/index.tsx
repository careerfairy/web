import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { Box, Typography } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { useCallback, useEffect, useState } from "react"
import { TabValue, useCompanyPage } from ".."
import { SeeAllLink } from "../Overview/SeeAllLink"
import { CreatorFormLayout } from "./CreatorFormLayout"
import { MentorCard } from "./MentorCard"
import { MentorForm } from "./MentorForm"

export const MentorsSection = () => {
   const {
      editMode,
      groupCreators,
      getCompanyPageTabLink,
      tabMode,
      setActiveTab,
   } = useCompanyPage()
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

   if (!groupCreators?.length) return null

   return (
      <Box>
         <ContentCarousel
            slideWidth={MentorCard.width}
            headerTitle={
               <Typography variant="brandedH3" fontWeight={"600"} color="black">
                  Mentors
               </Typography>
            }
            seeAll={
               <SeeAllLink
                  href={getCompanyPageTabLink(TabValue.mentors)}
                  onClick={
                     tabMode ? () => setActiveTab(TabValue.mentors) : undefined
                  }
               />
            }
            viewportSx={{
               // hack to ensure shadows are not cut off
               padding: "16px",
               margin: "-16px",
               width: "calc(100% + 16px)",
            }}
            headerRightSx={{
               mr: "16px",
            }}
            rootSx={{
               mr: "-16px",
            }}
            emblaProps={{
               emblaOptions: {
                  dragFree: true,
                  skipSnaps: true,
                  loop: false,
                  axis: "x",
               },
            }}
         >
            {mentors.map((creator) => (
               <Box key={`mentor-slide-box-${JSON.stringify(creator)}`}>
                  <MentorCard
                     creator={creator}
                     isEditMode={editMode}
                     handleEdit={() => handleOpen(creator)}
                  />
               </Box>
            ))}
         </ContentCarousel>
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
