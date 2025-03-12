import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { SectionAnchor, TabValue, useCompanyPage } from "../"
import CompanyPhotos from "./CompanyPhotos"
import CompanyVideo from "./CompanyVideo"

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
            // borderRadius={{
            //    xs: 0,
            //    mobile: 4,
            // }}
            p={2}
            spacing={3}
            // ml={{
            //    xs: 3,
            //    md: 0,
            // }}
            bgcolor={"white"}
            // border={"1px solid #EDE7FD"}
            sx={{
               border: (theme) => `1px solid ${theme.brand.white[400]}`,
               borderRadius: {
                  xs: "8px",
                  sm: "8px",
                  md: "12px",
               },
            }}
         >
            <CompanyPhotos />
            <CompanyVideo />
         </Stack>
      </Box>
   )
}

export default MediaSection
