import { FC, ReactNode } from "react"
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
import Image from "next/legacy/image"
import CircularProgress from "@mui/material/CircularProgress"
import FileUploader from "../../common/FileUploader"
import { alpha } from "@mui/material/styles"
import CheckIcon from "@mui/icons-material/Check"
import useUploadCV from "../../../custom-hook/user/useUploadCV"

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
      transition: (theme) =>
         theme.transitions.create(["border", "background-color"]),
   },
   cvUploaded: {
      border: (theme) => `2px solid ${theme.palette.grey[300]}`,
      bgcolor: "grey.50",
   },
   dragActive: {
      border: `2px solid #E0E0E0`,
      backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
   },
   root: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
   },
   greenCircle: {
      width: 68,
      height: 68,
      borderRadius: "50%",
      bgcolor: "success.main",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "3rem",
      fontWeight: 600,
   },
})

const CVUploadView: FC = () => {
   const { handleGoToView } = useCreditsDialogContext()

   return (
      <BaseDialogView
         handleBack={() => handleGoToView("GET_MORE_CREDITS")}
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
   const {
      fileUploaderProps,
      cvUploaded,
      isLoading,
      dragActive,
      progress,
      uploading,
   } = useUploadCV()

   return (
      <Stack sx={styles.root} flex={1} spacing={3}>
         <FileUploader
            {...fileUploaderProps}
            sx={[
               styles.uploadZone,
               dragActive && styles.dragActive,
               cvUploaded && styles.cvUploaded,
            ]}
         >
            <Content
               isLoading={isLoading}
               uploading={uploading}
               progress={progress}
               isComplete={cvUploaded}
            />
         </FileUploader>
      </Stack>
   )
}

type ContentProps = {
   isLoading: boolean
   uploading: boolean
   progress: number
   isComplete: boolean
}
const Content: FC<ContentProps> = ({
   isLoading,
   progress,
   uploading,
   isComplete,
}) => {
   if (isLoading) {
      return (
         <LoadingUI
            illustration={
               <CircularProgress
                  variant={uploading ? "determinate" : "indeterminate"}
                  value={progress}
                  color="secondary"
                  size={68}
                  thickness={6}
               />
            }
            label="Loading"
         />
      )
   }

   if (isComplete) {
      return (
         <LoadingUI
            illustration={
               <Box sx={styles.greenCircle}>
                  <CheckIcon color="inherit" fontSize="inherit" />
               </Box>
            }
            color="text.primary"
            label="CV uploaded!"
         />
      )
   }

   return (
      <LoadingUI
         illustration={
            <Image
               alt="upload cv icon"
               src={"/icons/upload.svg"}
               objectFit="contain"
               width={109}
               height={68}
               className="upload-icon"
            />
         }
         label="Upload your CV"
      />
   )
}

type LoadingUIProps = {
   illustration: ReactNode
   label: string
   color?: string
}
const LoadingUI: FC<LoadingUIProps> = ({
   label,
   illustration,
   color = "#6749EA",
}) => {
   return (
      <Stack justifyContent="center" alignItems="center" spacing={1}>
         {illustration}
         <Typography textAlign="center" variant="body1" color={color}>
            {label}
         </Typography>
      </Stack>
   )
}

export default CVUploadView
