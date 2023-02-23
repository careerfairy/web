import React from "react"
import { useCompanyPage } from "../index"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import PhotosGallery from "./PhotosGallery"
import useGroupPhotos from "./useGroupPhotos"
import PhotoUploadButton from "./PhotoUploadButton"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import PhotosDialog from "./PhotosDialog"

const CompanyPhotos = () => {
   const { editMode, group, groupPresenter } = useCompanyPage()

   const { updateSortablePhotos, photos, handleUploadPhotos, isUpdating } =
      useGroupPhotos(group, groupPresenter)

   const [photosDialogOpen, handleOpenPhotosDialog, handleClosePhotosDialog] =
      useDialogStateHandler()

   if (!editMode && !group.photos?.length) return null // no photos to show and not in edit mode so hide this section

   return (
      <Stack spacing={2}>
         <Stack
            justifyContent={"space-between"}
            alignItems={"center"}
            direction="row"
            spacing={2}
         >
            <Typography variant="h4" fontWeight={"600"} color="black">
               Photos
            </Typography>
            {editMode ? (
               <PhotoUploadButton
                  handleUploadPhotos={handleUploadPhotos}
                  isAddingPhotos={isUpdating}
               />
            ) : null}
         </Stack>
         <PhotosGallery
            onPhotosChanged={updateSortablePhotos}
            maxPhotos={6}
            editable={editMode}
            photos={photos}
            onAdditionalImageCountOverlayClick={handleOpenPhotosDialog}
         />
         <PhotosDialog
            open={photosDialogOpen}
            handleClose={handleClosePhotosDialog}
            onPhotosChanged={updateSortablePhotos}
            photos={photos}
            editable={editMode}
         />
      </Stack>
   )
}

export default CompanyPhotos
