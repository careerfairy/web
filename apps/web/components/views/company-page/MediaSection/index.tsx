import CompanyPhotos from "./CompanyPhotos"
import CompanyVideo from "./CompanyVideo"
import Stack from "@mui/material/Stack"
import { useCompanyPage } from "../index"

const MediaSection = () => {
   const { editMode, group } = useCompanyPage()

   if (!editMode && !group.photos?.length && !group.videos?.length) return null // no photos to show and not in edit mode so hide this section

   return (
      <Stack
         borderRadius={{
            xs: 0,
            mobile: 4,
         }}
         p={3}
         spacing={3}
         bgcolor={"background.default"}
      >
         <CompanyPhotos />
         <CompanyVideo />
      </Stack>
   )
}

export default MediaSection
