import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import useUploadLivestreamLogo from "components/custom-hook/live-stream/useUploadLivestreamLogo"
import AspectRatio from "components/views/common/AspectRatio"
import LogoUploaderWithCropping from "components/views/common/logos/LogoUploaderWithCropping"
import { useLivestreamCreationContext } from "../../../../LivestreamCreationContext"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"

const PADDING = "10px"
const PADDING_XY = "20px"

const styles = sxStyles({
   logoUploader: {
      container: {
         display: "flex",
         marginTop: `${PADDING}`,
         marginLeft: `${PADDING}`,
         height: `calc(100% - ${PADDING_XY})`,
         width: `calc(100% - ${PADDING_XY})`,
      },
      halo: {
         position: "absolute",
         width: "100%",
         height: "100%",
         borderRadius: "100%",
         border: "1px solid #EBEBEF",
         padding: PADDING,
      },
   },
})

const LogoUploader = () => {
   const {
      values: { general },
      setFieldValue,
   } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()

   const { handleUploadImage } = useUploadLivestreamLogo(
      livestream?.id,
      livestream?.isDraft
   )

   const handleUploadCompanyLogo = async (fileObject: File) => {
      const { url } = await handleUploadImage(fileObject)
      setFieldValue("general.companyLogoUrl", url, true)
   }

   return (
      <AspectRatio aspectRatio="1:1">
         <Box sx={styles.logoUploader.halo} />
         <Box sx={styles.logoUploader.container}>
            <LogoUploaderWithCropping
               logoUrl={general.companyLogoUrl}
               handleSubmit={handleUploadCompanyLogo}
            />
         </Box>
      </AspectRatio>
   )
}

export default LogoUploader
