import React from "react"
import { useCompanyPage } from "../index"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import PhotosGallery from "./PhotosGallery"
import useGroupPhotos from "./useGroupPhotos"
import PhotoUploadButton from "./PhotoUploadButton"
import EditDialog from "../EditDialog"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"

const CompanyPhotos = () => {
   const { editMode, group } = useCompanyPage()
   const { updateSortablePhotos, photos, handleUploadPhotos, isUpdating } =
      useGroupPhotos(group)
   const [open, handleClose] = useDialogStateHandler()

   if (!editMode && !group.photos?.length) return null

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
         />
         <EditDialog open={open} title={"Photos"} handleClose={handleClose}>
            <PhotosGallery
               onPhotosChanged={updateSortablePhotos}
               editable={editMode}
               photos={photos}
            />
         </EditDialog>
      </Stack>
   )
}

export default CompanyPhotos
