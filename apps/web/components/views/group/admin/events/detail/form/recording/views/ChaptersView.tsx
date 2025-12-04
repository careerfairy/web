import { Box, Button, Stack } from "@mui/material"
import { useLivestreamChapters } from "components/custom-hook/live-stream/chapters/useLivestreamChapters"
import useMenuState from "components/custom-hook/useMenuState"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { EmptyItemsView } from "components/views/common/EmptyItemsView"
import { livestreamService } from "data/firebase/LivestreamService"
import { useGroup } from "layouts/GroupDashboardLayout"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useState } from "react"
import { List, PlusCircle, Trash2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useRecordingFormContext } from "../RecordingFormProvider"
import { BaseDetailView } from "./BaseDetailView"
import { ChapterCard } from "./ChapterCard"
import { ChapterCardSkeleton } from "./ChapterCardSkeleton"
import { ChapterForm } from "./ChaptersForm"
import {
   ChaptersFormProvider,
   useChaptersFormContext,
} from "./ChaptersFormContext"

type ChaptersViewProps = {
   onBack: () => void
}

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      height: "100%",
   },
   list: {
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
   },
   addButton: {
      alignSelf: "stretch",
      borderColor: "neutral.200",
      color: "neutral.600",
      px: 2,
      py: 1,
      borderRadius: "18px",
      gap: 0.75,
      justifyContent: "center",
      "& svg": {
         width: 16,
         height: 16,
      },
   },
})

export const ChaptersView = ({ onBack }: ChaptersViewProps) => {
   return (
      <ChaptersFormProvider>
         <ChaptersViewContent onBack={onBack} />
      </ChaptersFormProvider>
   )
}

const ChaptersViewContent = ({ onBack }: ChaptersViewProps) => {
   const { livestream } = useRecordingFormContext()
   const { group } = useGroup()
   const groupId = group?.id
   const { data: livestreamChapters, status } = useLivestreamChapters(
      livestream?.id
   )
   const { errorNotification, successNotification } = useSnackbarNotifications()
   const {
      formType,
      isFormOpen,
      defaultValues,
      openCreateForm,
      cancelForm,
      handleSave,
      isSaving,
   } = useChaptersFormContext()

   const chapters = livestreamChapters || []

   const {
      handleClick: handleOpenConfirmationDialog,
      handleClose: handleCloseConfirmationDialog,
      open: isConfirmationDialogOpen,
   } = useMenuState()
   const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
      null
   )
   const [isDeleting, setIsDeleting] = useState<boolean>(false)

   const handleClickDeleteOption = (
      event: React.MouseEvent<HTMLElement>,
      chapterId: string
   ) => {
      handleOpenConfirmationDialog(event)
      setSelectedChapterId(chapterId)
   }

   const handleConfirmDeleteChapter = async () => {
      if (!selectedChapterId || !livestream?.id || !groupId) {
         return
      }

      setIsDeleting(true)
      try {
         await livestreamService.deleteChapter({
            livestreamId: livestream.id,
            groupId,
            chapterId: selectedChapterId,
         })

         successNotification("Chapter deleted successfully")
         handleCloseConfirmationDialog()
         setSelectedChapterId(null)
      } catch (error) {
         errorNotification(error, "Failed to delete chapter, please try again.")
      } finally {
         setIsDeleting(false)
      }
   }

   return (
      <BaseDetailView title="Chapters" onBack={onBack}>
         <Stack sx={styles.root}>
            {status === "loading" ? (
               Array.from({ length: 5 }).map((_, index) => (
                  <ChapterCardSkeleton key={index} />
               ))
            ) : (
               <>
                  <Stack sx={styles.list}>
                     {chapters.length === 0 ? (
                        <EmptyItemsView
                           title="No chapters yet"
                           description="Create chapters to help viewers navigate this recording."
                           icon={<List size={44} />}
                        />
                     ) : (
                        chapters.map((chapter) => (
                           <ChapterCard
                              key={chapter.id}
                              chapter={chapter}
                              handleClickDeleteOption={handleClickDeleteOption}
                           />
                        ))
                     )}
                  </Stack>
                  {formType === "create" ? (
                     <ChapterForm
                        onCancel={cancelForm}
                        onSave={handleSave}
                        isLoading={isSaving}
                        defaultValues={defaultValues}
                     />
                  ) : (
                     !isFormOpen && (
                        <Button
                           fullWidth
                           variant="outlined"
                           color="grey"
                           startIcon={<PlusCircle size={16} />}
                           sx={styles.addButton}
                           onClick={openCreateForm}
                        >
                           Add new chapter
                        </Button>
                     )
                  )}
               </>
            )}

            <ConfirmationDialog
               open={isConfirmationDialogOpen}
               title="Delete this chapter?"
               description={"This action is permanent."}
               width={414}
               icon={<Box component={Trash2} color="error.main" />}
               primaryAction={{
                  text: "Delete",
                  color: "error",
                  callback: handleConfirmDeleteChapter,
                  variant: "contained",
                  loading: isDeleting,
               }}
               secondaryAction={{
                  text: "Cancel",
                  color: "grey",
                  callback: handleCloseConfirmationDialog,
                  variant: "outlined",
                  loading: isDeleting,
               }}
               handleClose={handleCloseConfirmationDialog}
               hideCloseIcon
            />
         </Stack>
      </BaseDetailView>
   )
}
