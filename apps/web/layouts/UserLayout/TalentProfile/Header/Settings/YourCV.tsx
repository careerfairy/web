import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFileUploader from "components/custom-hook/useFileUploader"
import useFirebaseUpload from "components/custom-hook/useFirebaseUpload"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import { userRepo } from "data/RepositoryInstances"
import Link from "next/link"
import { FilePlus, FileText } from "react-feather"
import useSWRMutation from "swr/mutation"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"

const styles = sxStyles({
   emptyDetailsRoot: {
      alignItems: "center",
      width: {
         xs: "280px",
         sm: "280px",
         md: "400px",
      },
   },
   emptyTitle: {
      fontWeight: 600,
      textAlign: "center",
   },
   emptyDescription: {
      fontWeight: 400,
      textAlign: "center",
   },
   addButton: {
      p: "8px 16px",
   },
   root: {
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: "16px 12px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   progress: {
      zIndex: 1,
      width: "100%",
      mt: {
         xs: "90px",
         sm: "90px",
         md: 1,
      },
      borderRadius: "6px",
   },
   button: {
      "&:hover": {
         backgroundColor: (theme) => theme.palette.primary.light,
      },
   },
})

export const YourCV = () => {
   const { userPresenter, userData } = useAuth()
   const [uploadFile, uploadProgress, isUploading] = useFirebaseUpload()
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { trigger } = useSWRMutation(
      `update-profile-${userData.id}-resume`,
      handleUpdateResume,
      {
         onSuccess: () => {
            successNotification("CV uploaded successfully")
         },
         onError: (err) => {
            errorNotification(
               "Error updating CV, rest assured we're working on it!"
            )
            errorLogAndNotify(
               err,
               `Error uploading CV file, authId: ${userData.authId}`
            )
         },
         throwOnError: false, // We don't want to throw an error, we want to handle it ourselves in the onError callback above.
      }
   )

   const handleUploadCVFile = async (cv: File) => {
      try {
         const downloadUrl = await uploadFile(cv, userPresenter.getResumePath())

         return trigger({
            userId: userData.id,
            resumePath: downloadUrl,
            resumeName: cv.name,
         })
      } catch (error) {
         errorNotification(
            "Error uploading CV, rest assured we're working on it!"
         )
         errorLogAndNotify(error, "Error uploading CV file")
      }
   }

   const { fileUploaderProps: cvUploaderProps } = useFileUploader({
      acceptedFileTypes: ["pdf"],
      maxFileSize: 20,
      multiple: false,
      onValidated: handleUploadCVFile,
   })

   const EmptyView = (
      <EmptyYourCVView
         cvUploaderProps={cvUploaderProps}
         isUploading={isUploading}
         uploadProgress={uploadProgress}
      />
   )

   return (
      <Stack>
         <ConditionalWrapper
            condition={userPresenter.hasResume()}
            fallback={EmptyView}
         >
            <YourCVView
               cvUploaderProps={cvUploaderProps}
               isUploading={isUploading}
               uploadProgress={uploadProgress}
            />
         </ConditionalWrapper>
      </Stack>
   )
}

type CVViewProps = {
   cvUploaderProps: FileUploaderProps
   isUploading: boolean
   uploadProgress: number
}

const YourCVView = ({
   cvUploaderProps,
   isUploading,
   uploadProgress,
}: CVViewProps) => {
   const { userData, userPresenter } = useAuth()

   return (
      <Box sx={[styles.root, { cursor: "default" }]}>
         <Stack alignItems={"center"} spacing={2}>
            <Box color={"primary.main"}>
               <FileText size={48} />
            </Box>
            <Stack alignItems={"center"} spacing={1.5}>
               <ConditionalWrapper condition={userPresenter.hasResume()}>
                  <Stack spacing={0} alignItems={"center"}>
                     <Typography
                        variant="xsmall"
                        fontWeight={400}
                        color="neutral.600"
                     >
                        Current CV
                     </Typography>
                     <Typography
                        variant="medium"
                        fontWeight={400}
                        color="neutral.800"
                     >
                        {userData.resumeName}
                     </Typography>
                  </Stack>
               </ConditionalWrapper>
               <Stack direction={"row"} alignItems={"center"} spacing={1}>
                  <Link href={userData.userResume} target="_blank">
                     <Button variant="outlined" sx={styles.button}>
                        View CV
                     </Button>
                  </Link>
                  <FileUploader {...cvUploaderProps}>
                     <Button variant="outlined" sx={styles.button}>
                        Upload new CV
                     </Button>
                  </FileUploader>
               </Stack>
            </Stack>
         </Stack>
         {isUploading ? (
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={uploadProgress}
            />
         ) : null}
      </Box>
   )
}

const EmptyYourCVView = ({
   cvUploaderProps,
   isUploading,
   uploadProgress,
}: CVViewProps) => {
   return (
      <FileUploader {...cvUploaderProps}>
         <Box sx={styles.root}>
            <Stack alignItems={"center"} spacing={2}>
               <Box color={"primary.main"}>
                  <FilePlus size={48} />
               </Box>
               <Stack spacing={2} sx={styles.emptyDetailsRoot}>
                  <Stack alignItems={"center"}>
                     <Typography
                        sx={styles.emptyTitle}
                        color="neutral.800"
                        variant="brandedBody"
                     >
                        Upload your CV
                     </Typography>
                     <Typography
                        sx={styles.emptyDescription}
                        color={"neutral.700"}
                        variant="small"
                     >
                        Click to upload
                     </Typography>
                  </Stack>
               </Stack>
            </Stack>
            {isUploading ? (
               <LinearProgress
                  sx={styles.progress}
                  variant="determinate"
                  value={uploadProgress}
               />
            ) : null}
         </Box>
      </FileUploader>
   )
}

type Arguments = {
   userId: string
   resumePath: string
   resumeName: string
}

const handleUpdateResume = (
   _: string,
   { arg: { resumePath, resumeName, userId } }: { arg: Arguments }
) =>
   userRepo.updateUserData(userId, {
      resumeName: resumeName,
      userResume: resumePath,
   })
