import { LivestreamChapter } from "@careerfairy/shared-lib/livestreams"
import { Box, Typography } from "@mui/material"
import useMenuState from "components/custom-hook/useMenuState"
import { generateVideoThumbnailViaUrl } from "components/util/video"
import BrandedOptions from "components/views/common/inputs/BrandedOptions"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { useEffect, useState } from "react"
import { Edit2, Trash2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { ChapterForm, formatSecondsToTime } from "./ChaptersForm"
import { useChaptersFormContext } from "./ChaptersFormContext"

type ChapterCardProps = {
   chapter: LivestreamChapter
   handleClickDeleteOption: (
      event: React.MouseEvent<HTMLElement>,
      chapterId: string
   ) => void
}

const styles = sxStyles({
   chapterCard: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      width: "100%",
      minWidth: 0,
   },
   thumbnailWrapper: {
      width: (theme) => theme.spacing(11.25),
      height: (theme) => theme.spacing(6.25),
      borderRadius: 0.5,
      overflow: "hidden",
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      flexShrink: 0,
      backgroundColor: (theme) => theme.brand.white[400],
      position: "relative",
   },
   thumbnail: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
   },
   chapterContent: {
      display: "flex",
      flexDirection: "column",
      gap: 0.25,
      flexGrow: 1,
      minWidth: 0,
   },
   chapterHeader: {
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      minWidth: 0,
      width: "100%",
   },
   chapterTitle: {
      color: "neutral.800",
      flexGrow: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   timestamp: {
      color: "neutral.600",
   },
})

export const ChapterCard = ({
   chapter,
   handleClickDeleteOption,
}: ChapterCardProps) => {
   const {
      anchorEl,
      handleClick: handleOpenMenu,
      handleClose: handleCloseMenu,
      open,
   } = useMenuState()
   const {
      formType,
      editingChapterId,
      defaultValues,
      openEditForm,
      cancelForm,
      handleSave,
      isSaving,
      recordingUrl,
   } = useChaptersFormContext()
   const isEditing = formType === "edit" && editingChapterId === chapter.id
   const [thumbnail, setThumbnail] = useState<string | null>(null)

   useEffect(() => {
      if (recordingUrl && chapter.startSec !== undefined) {
         generateVideoThumbnailViaUrl(recordingUrl, chapter.startSec)
            .then((res) => {
               setThumbnail(res)
            })
            .catch((err) => console.error("Failed to generate thumbnail", err))
      }
   }, [recordingUrl, chapter.startSec])

   if (isEditing) {
      return (
         <ChapterForm
            onCancel={cancelForm}
            onSave={handleSave}
            isLoading={isSaving}
            defaultValues={defaultValues!}
         />
      )
   }

   const options: MenuOption[] = []
   options.push({
      label: "Edit chapter",
      icon: <Edit2 />,
      handleClick: (_event) => openEditForm(chapter),
   })
   options.push({
      label: "Delete chapter",
      icon: <Trash2 />,
      handleClick: (event: React.MouseEvent<HTMLElement>) =>
         handleClickDeleteOption(event, chapter.id),
      color: "error.main",
   })

   return (
      <Box key={chapter.id} sx={styles.chapterCard}>
         <Box sx={styles.thumbnailWrapper}>
            {Boolean(thumbnail) && (
               <Box
                  component="img"
                  src={thumbnail}
                  sx={styles.thumbnail}
                  alt={`Thumbnail at ${formatSecondsToTime(
                     Math.round(chapter.startSec)
                  )}`}
               />
            )}
         </Box>
         <Box sx={styles.chapterContent}>
            <Box sx={styles.chapterHeader}>
               <Typography variant="small" noWrap sx={styles.chapterTitle}>
                  {chapter.title}
               </Typography>
               <BrandedOptions onClick={handleOpenMenu} />
               <BrandedResponsiveMenu
                  options={options}
                  open={open}
                  handleClose={handleCloseMenu}
                  anchorEl={anchorEl}
               />
            </Box>
            <Typography variant="small" sx={styles.timestamp}>
               {formatSecondsToTime(Math.round(chapter.startSec))}
            </Typography>
         </Box>
      </Box>
   )
}
