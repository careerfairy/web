import React, { memo, useCallback, useMemo } from "react"
import EditDialog from "../EditDialog"
import {
   Box,
   FormControlLabel,
   Grid,
   Switch,
   TextField,
   Typography,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import { boolean, mixed, object, string } from "yup"
import "firebase/storage"
import useFirebaseUpload from "../../../custom-hook/useFirebaseUpload"
import { useCompanyPage } from "../index"
import { useFormik } from "formik"
import LoadingButton from "@mui/lab/LoadingButton"
import { v4 as uuid } from "uuid"
import Image from "next/legacy/image"
import { videoImagePlaceholder } from "../../../../constants/images"
import { sxStyles } from "../../../../types/commonTypes"
import { groupRepo } from "../../../../data/RepositoryInstances"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import ReactPlayer from "react-player"
import { videoUrlRegex } from "../../../../constants/forms"
import { GroupVideo } from "@careerfairy/shared-lib/groups"

const styles = sxStyles({
   root: {
      "& .MuiFormHelperText-root": {
         pl: 0,
      },
   },
   videoUploadWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
      border: "dashed",
      borderRadius: 2,
      borderColor: "grey.400",
      borderWidth: 2,
      minHeight: 150,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   errorVideoUploadWrapper: {
      borderColor: "error.main",
   },
   videoUploadImageWrapper: {
      position: "absolute",
      inset: 0,
      maxWidth: "70%",
      maxHeight: "70%",
      transform: "translate(-50%,-50%)",
      left: "50%",
      top: "50%",
   },
   uploadArea: {
      position: "absolute",
      inset: 0,
      opacity: 0,
      cursor: "pointer",
   },
   videoErrorText: {
      color: "error.main",
      fontSize: "12px",
      fontWeight: 500,
      position: "absolute",
      bottom: 5,
      left: 8,
   },
   videoPlayerWrapper: {
      aspectRatio: "16 / 9",
      maxHeight: 195,
      p: 0.5,
      "& > *": {
         borderRadius: 1,
         overflow: "hidden",
      },
   },
   hidden: {
      display: "none",
      visibility: "hidden",
   },
})

type VideoFormData = {
   title: string
   description: string
   isEmbedded: boolean
   file?: File
   url?: string
}

type Props = {
   open: boolean
   handleClose: () => void
}

const VideoDialog = ({ handleClose, open }: Props) => {
   const { errorNotification, successNotification } = useSnackbarNotifications()
   const { group, groupPresenter } = useCompanyPage()

   const [uploadFile, uploadProgress] = useFirebaseUpload()

   const initialVideo = group.videos?.[0]

   const formik = useFormik<VideoFormData>({
      initialValues: {
         title: initialVideo?.title || "",
         description: initialVideo?.description || "",
         isEmbedded: initialVideo?.isEmbedded || false,
         url: initialVideo?.url || "",
      },

      validationSchema: videoFormSchema,
      onSubmit: async (values) => {
         try {
            const { title, description, isEmbedded, file, url } = values
            let videoUrl: string
            const videoId = uuid()

            if (isEmbedded) {
               videoUrl = url as string
            } else {
               const path =
                  groupPresenter.getCompanyPageStorageVideoPath(videoId)

               videoUrl = await uploadFile(file, path)
            }

            const newVideo: GroupVideo = {
               id: videoId,
               description,
               title,
               url: videoUrl,
               isEmbedded,
            }

            // We only allow one video per group for now, but might change in the future
            await groupRepo.updateGroupVideos(group.id, [newVideo])

            successNotification("Video added successfully")

            handleClose()
         } catch (error) {
            errorNotification(
               error,
               "Error while adding video, please try again later"
            )
         }
      },
   })

   const fileUrl = useMemo(() => {
      if (formik.values.file?.type?.includes("video")) {
         return URL.createObjectURL(formik.values.file)
      }
      return ""
   }, [formik.values.file])

   const videoPreview = useCallback(() => {
      const videoUrl = fileUrl || formik.values.url

      if (videoUrl) {
         return <MemoizedVideoPlayer url={videoUrl} />
      }

      return (
         <Box sx={styles.videoUploadImageWrapper}>
            <Image
               src={videoImagePlaceholder}
               alt="video preview placeholder image"
               layout="fill"
               objectFit="contain"
            />
         </Box>
      )
   }, [fileUrl, formik.values.url])

   const renderSaveButton = useCallback(() => {
      return (
         <Box display={"flex"} justifyContent={"flex-end"}>
            <LoadingButton
               loading={formik.isSubmitting}
               disabled={formik.isSubmitting}
               color="secondary"
               type={"submit"}
               variant={"contained"}
               onClick={() => formik.handleSubmit()}
            >
               Save & Close
            </LoadingButton>
         </Box>
      )
   }, [formik])

   return (
      <Box sx={styles.root} component={"form"} onSubmit={formik.handleSubmit}>
         <EditDialog open={open} title={"Videos"} handleClose={handleClose}>
            <Grid spacing={2} container>
               <Grid item xs={12} sm={6} md={4}>
                  <Box
                     sx={[
                        styles.videoUploadWrapper,
                        formik.errors.file && styles.errorVideoUploadWrapper,
                     ]}
                  >
                     <Typography sx={styles.videoErrorText}>
                        {formik.errors.file ? (
                           <div>{formik.errors.file}</div>
                        ) : null}
                     </Typography>
                     {videoPreview()}
                     {formik.values.isEmbedded ? null : (
                        <Box
                           component={"input"}
                           type="file"
                           id="file"
                           accept="video/*"
                           name="file"
                           sx={styles.uploadArea}
                           onChange={(event) =>
                              formik.setFieldValue(
                                 "file",
                                 event.target.files?.[0]
                              )
                           }
                           onBlur={formik.handleBlur}
                        />
                     )}
                     {uploadProgress > 0 && uploadProgress < 100 ? (
                        <div>Uploading... {uploadProgress.toFixed(2)}%</div>
                     ) : null}
                  </Box>
               </Grid>
               <Grid item xs={12} sm={6} md={8}>
                  <Stack spacing={2}>
                     <TextField
                        type="text"
                        id="title"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label={"Title"}
                        fullWidth
                        error={
                           formik.touched.title ? !!formik.errors.title : null
                        }
                        helperText={
                           formik.touched.title && formik.errors.title
                              ? formik.errors.title
                              : null
                        }
                        placeholder={"Enter the title of video"}
                     />
                     <TextField
                        type="text"
                        id="description"
                        name="description"
                        multiline={true}
                        rows={5}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label={"Description"}
                        placeholder={"Enter the video description"}
                        fullWidth
                        error={
                           formik.touched.description
                              ? !!formik.errors.description
                              : null
                        }
                        helperText={
                           formik.touched.description &&
                           formik.errors.description
                              ? formik.errors.description
                              : null
                        }
                     />
                  </Stack>
               </Grid>
               <Grid item container spacing={2} xs={12}>
                  <Grid item xs={12} sm={6} md={4}>
                     <Box
                        display={"flex"}
                        width={"100%"}
                        height={"100%"}
                        alignItems={"center"}
                     >
                        <FormControlLabel
                           control={
                              <Switch
                                 checked={formik.values.isEmbedded}
                                 onChange={(e) => {
                                    // clear file if embedded is checked
                                    formik.setFieldValue("file", undefined)
                                    formik.setFieldValue("url", "")
                                    formik.handleChange(e)
                                 }}
                                 onBlur={formik.handleBlur}
                                 name="isEmbedded"
                                 color="primary"
                              />
                           }
                           label={<Typography>Embed Video</Typography>}
                        />
                     </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={8}>
                     {formik.values.isEmbedded ? (
                        <TextField
                           type="text"
                           id="url"
                           name="url"
                           value={formik.values.url}
                           onChange={formik.handleChange}
                           onBlur={formik.handleBlur}
                           label={"Paste video URL here"}
                           fullWidth
                           error={
                              formik.touched.url ? !!formik.errors.url : null
                           }
                           helperText={
                              formik.touched.url && formik.errors.url
                                 ? formik.errors.url
                                 : null
                           }
                        />
                     ) : (
                        renderSaveButton()
                     )}
                  </Grid>
                  {formik.values.isEmbedded ? (
                     <Grid item xs={12}>
                        {renderSaveButton()}
                     </Grid>
                  ) : null}
               </Grid>
            </Grid>
         </EditDialog>
      </Box>
   )
}

const videoFormSchema = object({
   title: string()
      .required("Title is required")
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
   description: string()
      .required("Description is required")
      .min(3, "Description must be at least 3 characters")
      .max(1000, "Description must be less than 1000 characters"),
   isEmbedded: boolean().required(),
   file: mixed<File>().when(["isEmbedded", "url"], {
      // If isEmbedded is false and url is not provided, perform validation
      is: (isEmbedded: boolean, url: string) => !isEmbedded && !url,
      then: mixed<File>()
         .required("File is required")
         .test("file-size", "File size too large", (value) => {
            if (!value) return true

            // size must be less than 100MB
            return value.size <= 104857600 // 100MB
         })
         .test("file-type", "Invalid file type", (value) => {
            if (!value) return true
            return ["video/mp4", "video/webm", "video/ogg"].includes(value.type)
         }),
   }),
   url: string().when("isEmbedded", {
      is: true,
      then: string()
         .required("URL is required")
         .matches(videoUrlRegex, "Invalid video URL"),
   }),
})

const VideoPlayer = ({ url }: { url: string }) => {
   return (
      <Box sx={styles.videoPlayerWrapper}>
         <ReactPlayer
            url={url}
            alt="video preview"
            width={"100%"}
            height={"100%"}
         />
      </Box>
   )
}

const MemoizedVideoPlayer = memo(VideoPlayer)
export default VideoDialog
