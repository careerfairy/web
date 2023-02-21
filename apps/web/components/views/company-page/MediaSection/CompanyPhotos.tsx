import React from "react"
import { useCompanyPage } from "../index"
import { Button, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import PhotoSortExample, { SortablePhoto } from "./PhotoSortExample"

const photoSet: SortablePhoto[] = Array.from({ length: 20 }, (_, i) => ({
   id: `${i}`,
   src: `https://loremflickr.com/320/240?random=${i}`,
   alt: `Photo ${i}`,
   height: 240,
   width: 320,
   title: `Photo ${i}`,
}))
const CompanyPhotos = () => {
   const { editMode } = useCompanyPage()
   console.log("-> editMode", editMode)
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
            <Button
               startIcon={<AddCircleOutlineIcon />}
               variant="text"
               color="primary"
            >
               <Typography fontSize={"15px"} fontWeight={"600"}>
                  ADD PHOTO
               </Typography>
            </Button>
         </Stack>
         <PhotoSortExample draggable={editMode} photos={photoSet} />
      </Stack>
   )
}

export default CompanyPhotos
