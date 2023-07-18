import { Creator } from "@careerfairy/shared-lib/groups/creators"
import CameraIcon from "@mui/icons-material/PhotoCameraOutlined"
import {
   Avatar,
   Box,
   CardActionArea,
   FormHelperText,
   Grid,
   Typography,
} from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import useUploadCreatorAvatar from "components/custom-hook/creator/useUploadCreatorAvatar"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { groupRepo } from "data/RepositoryInstances"
import { Form, Formik, useField } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, Fragment, useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import SparksDialog, { useSparksForm } from "../SparksDialog"

const styles = sxStyles({
   avaGrid: {
      display: "flex",
      justifyContent: "center",
   },
   avaRoot: {
      mx: "auto",
      width: 136,
      height: 136,
      borderRadius: "50%",
   },
   avatar: {
      width: "100%",
      height: "100%",
      bgcolor: "#F7F8FC",
      border: "1px solid #EDE7FD",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#9999B1",
      flexDirection: "column",
      transition: (theme) =>
         theme.transitions.create(["border", "background-color"]),
   },
   icon: {
      width: 36,
      height: 36,
   },
   uploadText: {
      textAlign: "center",
      fontSize: "0.85714rem !important",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "141%",
   },
   avatarUploaded: {
      border: (theme) => `2px solid ${theme.palette.grey[300]}`,
      bgcolor: "grey.50",
   },
   dragActive: {
      bgcolor: "secondary.main",
      color: "white",
   },
   helperText: {
      textAlign: "center",
   },
})

type FormValues = {
   avatarUrl: string
   avatarFile: File | null
   firstName: string
   lastName: string
   position: string
   linkedInUrl: string
   story: string
   email: string
}

const getInitialValues = (creator?: Creator): FormValues => ({
   avatarUrl: creator?.avatarUrl || "",
   avatarFile: null,
   firstName: creator?.firstName || "",
   lastName: creator?.lastName || "",
   position: creator?.position || "",
   linkedInUrl: creator?.linkedInUrl || "",
   story: creator?.story || "",
   email: creator?.email || "",
})

const CreateCreatorView = () => {
   const { goToSelectCreatorView, goToCreatorSelectedView } = useSparksForm()
   const { group } = useGroup()
   const { handleUploadFile } = useUploadCreatorAvatar(group.id)

   const selectedCreatorId = useSelector(sparksSelectedCreatorId)

   const handleBack = useCallback(
      (callback?: () => void) => {
         goToSelectCreatorView()
         if (callback) callback()
      },
      [goToSelectCreatorView]
   )

   return (
      <CreatorFetchWrapper
         selectedCreatorId={selectedCreatorId}
         groupId={group.id}
         shouldFetch={Boolean(selectedCreatorId)}
      >
         {(creator) => (
            <SparksDialog.Container onMobileBack={() => handleBack()}>
               {creator ? (
                  <SparksDialog.Title pl={2}>
                     <Box component="span" color="secondary.main">
                        Editing
                     </Box>{" "}
                     creator
                  </SparksDialog.Title>
               ) : (
                  <SparksDialog.Title pl={2}>
                     Create a new{" "}
                     <Box component="span" color="secondary.main">
                        profile
                     </Box>
                  </SparksDialog.Title>
               )}
               <SparksDialog.Subtitle>
                  {creator
                     ? "Please check if that’s the correct creator"
                     : "Insert your new creator details!"}
               </SparksDialog.Subtitle>
               <Box mt={4} />
               <Formik
                  initialValues={getInitialValues(creator)}
                  validationSchema={CreateCreatorSchema}
                  enableReinitialize
                  onSubmit={async (
                     values,
                     { setSubmitting, setFieldError }
                  ) => {
                     let avatarUrl = values.avatarUrl
                     let creatorId = creator?.id

                     if (values.avatarFile) {
                        avatarUrl = await handleUploadFile(values.avatarFile)
                     }

                     // Before making the request, we validate if the email is unique
                     if (
                        !creator &&
                        !(await groupRepo.creatorEmailIsUnique(
                           group.id,
                           values.email
                        ))
                     ) {
                        // If the email is not unique and we are trying to create a new creator
                        // we set an error to the email field and prevent the form from being submitted
                        setFieldError("email", "Email has already been taken")
                        setSubmitting(false)
                        return
                     }

                     if (creator) {
                        await groupRepo.updateCreatorInGroup(
                           group.id,
                           creator.id,
                           {
                              avatarUrl,
                              firstName: values.firstName,
                              lastName: values.lastName,
                              position: values.position,
                              linkedInUrl: values.linkedInUrl,
                              story: values.story,
                              id: creator.id,
                           }
                        )
                     } else {
                        creatorId = await groupRepo.addCreatorToGroup(
                           group.id,
                           {
                              avatarUrl,
                              email: values.email,
                              firstName: values.firstName,
                              lastName: values.lastName,
                              position: values.position,
                              linkedInUrl: values.linkedInUrl,
                              story: values.story,
                           }
                        )
                     }

                     setSubmitting(false)

                     goToCreatorSelectedView(creatorId)
                  }}
               >
                  {({
                     submitForm,
                     isSubmitting,
                     dirty,
                     isValid,
                     resetForm,
                  }) => (
                     <Form>
                        <Grid container spacing={2}>
                           <Grid sx={styles.avaGrid} item xs={12}>
                              <AvatarUpload
                                 name="avatarFile"
                                 groupId={group.id}
                                 remoteUrl={creator?.avatarUrl}
                              />
                              <Box mt={2} />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="firstName"
                                 type="text"
                                 label="First Name"
                                 placeholder="John"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="lastName"
                                 type="text"
                                 label="Last Name"
                                 placeholder="Doe"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="position"
                                 type="text"
                                 label="Position"
                                 placeholder="Ex: Marketing Manager"
                                 autoComplete="organization-title"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="linkedInUrl"
                                 type="text"
                                 label="LinkedIn Link"
                                 placeholder="Ex: linkedin.com/in/user"
                                 autoComplete="url"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12}>
                              <BrandedTextFieldField
                                 name="email"
                                 type="text"
                                 label="Email address"
                                 placeholder="ex: John@careerfairy.io"
                                 disabled={Boolean(selectedCreatorId)} // if we are editing a creator, we don't want to allow changing the email
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12}>
                              <BrandedTextFieldField
                                 name="story"
                                 type="text"
                                 label="Personal story"
                                 placeholder="Tell us about yourself!"
                                 fullWidth
                                 multiline
                                 rows={4}
                              />
                           </Grid>
                        </Grid>
                        <SparksDialog.ActionsOffset />
                        <SparksDialog.Actions>
                           <SparksDialog.Button
                              color="grey"
                              variant="outlined"
                              onClick={() => handleBack(resetForm)}
                           >
                              Back
                           </SparksDialog.Button>
                           <SparksDialog.Button
                              variant="contained"
                              onClick={submitForm}
                              disabled={isSubmitting || !dirty || !isValid}
                              loading={isSubmitting}
                           >
                              {creator ? "Save changes" : "Create"}
                           </SparksDialog.Button>
                        </SparksDialog.Actions>
                     </Form>
                  )}
               </Formik>
            </SparksDialog.Container>
         )}
      </CreatorFetchWrapper>
   )
}

type AvatarUploadProps = {
   groupId: string
   name: string
   remoteUrl?: string
}

const AvatarUpload: FC<AvatarUploadProps> = ({ name, remoteUrl }) => {
   const [field, meta, helpers] = useField<File>(name)

   const handleTouched = useCallback(() => {
      helpers.setTouched(true, false)
   }, [helpers])

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["png", "jpeg", "jpg", "PNG", "JPEG", "JPG"],
      maxFileSize: 10, // MB
      multiple: false,
      onValidated: async (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         await helpers.setValue(newFile, false)
         handleTouched()
         helpers.setError(undefined)
      },
   })

   const blobUrl = useMemo(() => {
      if (field.value) {
         return URL.createObjectURL(field.value)
      }
   }, [field.value])

   return (
      <Box
         display="flex"
         flexDirection="column"
         alignItems="center"
         justifyContent="center"
      >
         <FileUploader {...fileUploaderProps}>
            <CardActionArea onClick={handleTouched} sx={styles.avaRoot}>
               <Avatar
                  src={remoteUrl || blobUrl}
                  sx={[styles.avatar, dragActive && styles.dragActive]}
               >
                  <Fragment>
                     <CameraIcon sx={styles.icon} color="inherit" />
                     <Typography
                        color="inherit"
                        variant="h5"
                        sx={styles.uploadText}
                     >
                        Upload speaker picture
                     </Typography>
                  </Fragment>
               </Avatar>
            </CardActionArea>
         </FileUploader>
         {meta.touched && meta.error ? (
            <FormHelperText sx={styles.helperText} error>
               {meta.error}
            </FormHelperText>
         ) : null}
      </Box>
   )
}

const CreateCreatorSchema = yup.object().shape({
   firstName: yup
      .string()
      .max(50, "First Name must be less than 50 characters")
      .required("First Name is required"),
   lastName: yup
      .string()
      .max(50, "Last Name must be less than 50 characters")
      .required("Last Name is required"),
   position: yup
      .string()
      .max(50, "Position must be less than 50 characters")
      .required("Position is required"),
   email: yup.string().email("Invalid email").required("Email is required"),
   linkedInUrl: yup
      .string()
      .url()
      .matches(/linkedin.com/),
   story: yup.string().max(500, "Story must be less than 500 characters"),

   avatarUrl: yup.string(),
   avatarFile: yup.mixed<File>().when("avatarUrl", {
      is: (avatarUrl: string) => !avatarUrl, // if avatarUrl is empty
      then: yup // then avatarFile is required
         .mixed<File>()
         .test("avatarFile", "Avatar is required", function (value) {
            return Boolean(value)
         }),
   }),
})

export default CreateCreatorView
