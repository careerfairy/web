import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { useCompanyPage } from "../"
import CompanyPhotos from "./CompanyPhotos"
import CompanyVideo from "./CompanyVideo"

const MediaSection = () => {
   const { editMode, group } = useCompanyPage()

   if (!editMode && !group.photos?.length && !group.videos?.length) return null // no photos to show and not in edit mode so hide this section

   return (
      <Box position={"relative"}>
         <Stack
            p={2}
            spacing={3}
            bgcolor={"white"}
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
