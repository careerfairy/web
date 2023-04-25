import { FC, useState } from "react"
import BaseDialogView, {
   LeftContent,
   RightContent,
   SubHeaderText,
   TitleText,
} from "../BaseDialogView"
import { useCreditsDialogContext } from "../CreditsDialog"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../types/commonTypes"
import { Box, Typography } from "@mui/material"
import Image from "next/image"
import CircularProgress from "@mui/material/CircularProgress"

const styles = sxStyles({
   uploadZone: {
      borderRadius: "15px",
      border: `2px solid #D0C6FF`,
      bgcolor: "#F1EEFF",
      flex: 1,
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   root: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
   },
})

const CVUploadView: FC = () => {
   const { handleGoToGetMoreCreditsView } = useCreditsDialogContext()

   return (
      <BaseDialogView
         handleBack={handleGoToGetMoreCreditsView}
         leftContent={
            <LeftContent
               title={
                  <TitleText>
                     Upload your <TitleText color="primary.main">CV</TitleText>!
                  </TitleText>
               }
               subHeader={
                  <SubHeaderText>
                     Running low on coins? no worries! You can easily win more
                     by interacting with our platform.
                  </SubHeaderText>
               }
            />
         }
         rightContent={
            <RightContent>
               <View />
            </RightContent>
         }
      />
   )
}

const View = () => {
   const [loading, setLoading] = useState(false)
   const [loadingProgress, setLoadingProgress] = useState(0)

   return (
      <Stack sx={styles.root} flex={1} spacing={3}>
         <Box sx={styles.uploadZone}>
            <Stack spacing={1}>
               {loading ? (
                  <CircularProgress
                     variant="determinate"
                     value={loadingProgress}
                     color="secondary"
                     size={68}
                     thickness={6}
                  />
               ) : (
                  <Image
                     alt="upload cv icon"
                     src={"/icons/upload.svg"}
                     objectFit="contain"
                     width={109}
                     height={68}
                     className="upload-icon"
                  />
               )}
               <Typography textAlign="center" variant="body1" color="#6749EA">
                  {loading ? "Loading" : "Upload your CV"}
               </Typography>
            </Stack>
         </Box>
      </Stack>
   )
}

export default CVUploadView
