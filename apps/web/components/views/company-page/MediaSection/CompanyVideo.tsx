import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import LoadingButton from "@mui/lab/LoadingButton"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { useCompanyPage } from "../index"
import VideoComponent from "./VideoComponent"
import VideoDialog from "./VideoDialog"

const CompanyVideo = () => {
   const { editMode, group } = useCompanyPage()

   const [videoDialogOpen, handleOpenVideoDialog, handleCloseVideoDialog] =
      useDialogStateHandler()

   if (!editMode && !group.videos?.length) return null // no photos to show and not in edit mode so hide this section

   const hasVideo = !!group?.videos?.length

   return (
      <Stack position={"relative"} spacing={2}>
         <Stack
            justifyContent={"space-between"}
            alignItems={"center"}
            direction="row"
            spacing={2}
         >
            <Typography variant="h4" fontWeight={"600"} color="black">
               Video
            </Typography>
            {editMode && !hasVideo ? (
               <LoadingButton
                  onClick={handleOpenVideoDialog}
                  startIcon={<AddCircleOutlineIcon />}
                  variant="text"
                  color="primary"
               >
                  <Typography fontSize={"15px"} fontWeight={"600"}>
                     Add video
                  </Typography>
               </LoadingButton>
            ) : null}
         </Stack>
         <VideoComponent
            openVideoDialog={editMode ? handleOpenVideoDialog : undefined}
            video={group.videos?.[0]}
            editMode={editMode}
         />
         {videoDialogOpen && editMode ? (
            <VideoDialog
               open={videoDialogOpen}
               handleClose={handleCloseVideoDialog}
            />
         ) : null}
      </Stack>
   )
}

export default CompanyVideo
