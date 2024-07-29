import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Typography } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ContentCarousel } from "components/views/mentor-page/ContentCarousel"
import { useCallback, useState } from "react"
import { useMountedState } from "react-use"
import { useCompanyPage } from ".."
import { CreatorFormLayout } from "./CreatorFormLayout"
import { MentorCard } from "./MentorCard"
import { MentorForm } from "./MentorForm"

export const MentorsSection = () => {
   const isMobile = useIsMobile()

   const [selectedMentor, setSelectedMentor] = useState<PublicCreator | null>(
      null
   )

   const { editMode, groupCreators } = useCompanyPage()
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const isMounted = useMountedState()

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
            {groupCreators.map((creator) => (
               <MentorCard
                  key={`mentor-slide-box-${creator.id}`}
                  creator={creator}
                  isEditMode={editMode}
                  handleEdit={() => handleOpen(creator)}
               />
            ))}
         </ContentCarousel>
         <CreatorFormLayout.Dialog
            isDialogOpen={isDialogOpen}
            handleCloseDialog={handleClose}
            isMobile={isMobile}
         >
            <MentorForm mentor={selectedMentor} handleClose={handleClose} />
         </CreatorFormLayout.Dialog>
      </Box>
   )
}
