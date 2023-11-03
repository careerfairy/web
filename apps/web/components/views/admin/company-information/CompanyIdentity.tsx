import { Box, Stack, Typography } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC } from "react"
import Styles from "./BaseStyles"
import CompanyBanner from "./CompanyBanner"
import SectionComponent from "./SectionComponent"
import LogoUploaderWithCropping from "components/views/common/logos/LogoUploaderWithCropping"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import useUploadGroupLogo from "components/custom-hook/group/useUploadGroupLogo"

const [title, description] = [
   "Company identity",
   "Choose your brand visuals so that talent can easily recognise you.",
]

const CompanyIdentity: FC = () => {
   const { group, groupPresenter } = useGroup()
   const { handleUploadImage: handleUploadLogo } = useUploadGroupLogo(group.id)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const handleSubmitLogo = async (file: File) => {
      try {
         await handleUploadLogo(file)
         successNotification("Update successfull")
      } catch (e) {
         errorNotification(e, e)
      }
   }

   return (
      <SectionComponent title={title} description={description}>
         <Stack
            spacing={{
               xs: 3,
               md: 1.5,
            }}
         >
            <Stack spacing={{ xs: 2, md: 1.25 }}>
               <span>
                  <Typography
                     component="h4"
                     gutterBottom
                     sx={Styles.section.h4}
                  >
                     Upload your company profile picture
                  </Typography>
                  <Typography component="h5" sx={Styles.section.h5}>
                     The optimal size for this picture is 1080x1080 pixels
                  </Typography>
               </span>
               {/* Uploading && Cropping Company logo image */}
               <Box width={140} height={140}>
                  <LogoUploaderWithCropping
                     handleSubmit={handleSubmitLogo}
                     logoUrl={groupPresenter.getCompanyLogoUrl()}
                  />
               </Box>
            </Stack>

            <Stack spacing={{ xs: 2, md: 1.25 }}>
               <span>
                  <Typography
                     component="h4"
                     gutterBottom
                     sx={[Styles.section.h4]}
                  >
                     Company banner
                  </Typography>

                  <Typography component="h5" sx={Styles.section.h5}>
                     This image is going to be used as the banner on your
                     company page. It can always be changed.
                  </Typography>
               </span>

               {/* Uploading banner image */}
               <CompanyBanner
                  url={groupPresenter.getCompanyBannerUrl()}
                  groupId={group.id}
               />
            </Stack>
         </Stack>
      </SectionComponent>
   )
}

export default CompanyIdentity
