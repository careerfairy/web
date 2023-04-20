import CompanyPhotos from "./CompanyPhotos"
import CompanyVideo from "./CompanyVideo"
import Stack from "@mui/material/Stack"
import { SectionAnchor, TabValue, useCompanyPage } from "../"
import Box from "@mui/material/Box"

const MediaSection = () => {
   const {
      editMode,
      group,
      sectionRefs: { mediaSectionRef },
   } = useCompanyPage()

   if (!editMode && !group.photos?.length && !group.videos?.length) return null // no photos to show and not in edit mode so hide this section

   return (
      <Box position={"relative"}>
         <SectionAnchor ref={mediaSectionRef} tabValue={TabValue.media} />
         <Stack
            borderRadius={{
               xs: 0,
               mobile: 4,
            }}
            p={3}
            spacing={3}
            bgcolor={"white"}
            border={"1px solid #EDE7FD"}
         >
            <CompanyPhotos />
            <CompanyVideo />
         </Stack>
      </Box>
   )
}

export default MediaSection
