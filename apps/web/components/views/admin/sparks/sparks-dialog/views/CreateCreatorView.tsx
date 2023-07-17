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
import useGroupCreatorOnce from "components/custom-hook/creator/useGroupCreator"
import useUploadCreatorAvatar from "components/custom-hook/creator/useUploadCreatorAvatar"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { groupRepo } from "data/RepositoryInstances"
import { Form, Formik, useField } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import debounce from "lodash.debounce"
import { FC, Fragment, ReactNode, useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import SparksDialog, { useSparksForm } from "../SparksDialog"

const styles = sxStyles({
   root: {
      m: "auto",
      width: "100%",
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
      <Wrapper
         selectedCreatorId={selectedCreatorId}
         groupId={group.id}
         shouldFetch={Boolean(selectedCreatorId)}
      >
         {(creator) => (
            <SparksDialog.Container
               onMobileBack={() => handleBack()}
               withActionsOffset
               sx={styles.root}
            >
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
                  initialValues={{
                     avatarUrl: creator?.avatarUrl || "",
                     avatarFile: null,
                     firstName: creator?.firstName || "",
                     lastName: creator?.lastName || "",
                     position: creator?.position || "",
                     linkedInUrl: creator?.linkedInUrl || "",
                     story: creator?.story || "",
                     email: creator?.email || "",
                  }}
                  // Don't validate email uniqueness if editing creator
                  validationSchema={getCreateCreatorSchema(group.id, !creator)}
                  enableReinitialize
                  onSubmit={async (values, { setSubmitting }) => {
                     let avatarUrl = values.avatarUrl
                     let creatorId = creator?.id

                     if (values.avatarFile) {
                        avatarUrl = await handleUploadFile(values.avatarFile)
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
                     errors,
                  }) => (
                     <Form>
                        <Grid container spacing={2}>
                           <Grid item xs={12}>
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
                                 error={Boolean(errors.email)}
                                 helperText={errors.email}
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
      </Wrapper>
   )
}

type CreatorFetchWrapperProps = {
   groupId: string
   selectedCreatorId?: string
   children: (creator: Creator | null) => ReactNode
}

const CreatorFetchWrapper: FC<CreatorFetchWrapperProps> = ({
   groupId,
   selectedCreatorId,
   children,
}) => {
   const { data: creator } = useGroupCreatorOnce(groupId, selectedCreatorId)
   return <>{children(creator)}</>
}

type WrapperProps = {
   shouldFetch: boolean
}

const Wrapper: FC<WrapperProps & CreatorFetchWrapperProps> = ({
   shouldFetch,
   groupId,
   selectedCreatorId,
   children,
}) => {
   if (shouldFetch) {
      return (
         <CreatorFetchWrapper
            groupId={groupId}
            selectedCreatorId={selectedCreatorId}
         >
            {children}
         </CreatorFetchWrapper>
      )
   } else {
      return <>{children(null)}</>
   }
}

type AvatarUploadProps = {
   groupId: string
   name: string
   remoteUrl?: string
}

const AvatarUpload: FC<AvatarUploadProps> = ({ name, remoteUrl }) => {
   const [field, meta, helpers] = useField<File>(name)

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["png", "jpeg", "jpg", "PNG", "JPEG", "JPG"],
      maxFileSize: 10, // MB
      multiple: false,
      onValidated: (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         helpers.setValue(newFile, false)
         helpers.setTouched(true, false)
         helpers.setError("")
      },
   })

   const blobUrl = useMemo(() => {
      if (field.value) {
         return URL.createObjectURL(field.value)
      }
   }, [field.value])

   return (
      <>
         <FileUploader {...fileUploaderProps}>
            <CardActionArea sx={styles.avaRoot}>
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
         {meta.error ? (
            <FormHelperText sx={styles.helperText} error>
               {meta.error}
            </FormHelperText>
         ) : null}
      </>
   )
}

const getCreateCreatorSchema = (
   groupId: string,
   shouldValidateEmailUniqueness: boolean
) =>
   yup.object().shape({
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
      email: yup
         .string()
         .email("Invalid email")
         .required("Email is required")
         .test("email", "Email has already been taken", function (value) {
            return shouldValidateEmailUniqueness
               ? validateEmailUniqueness(groupId, value)
               : true
         }),
      linkedInUrl: yup
         .string()
         .url()
         .matches(/linkedin.com/),
      story: yup.string().max(500, "Story must be less than 500 characters"),

      avatarUrl: yup
         .string()
         .test("avatarFile", "Avatar is required", function (value) {
            const { avatarFile } = this.parent
            return Boolean(value || avatarFile)
         }),
      avatarFile: yup.mixed<File>().when("avatarUrl", {
         is: (avatarUrl: string) => !avatarUrl, // if avatarUrl is empty
         then: yup // then avatarFile is required
            .mixed<File>()
            .required("Avatar file is required")
            .test("avatarFile", "Avatar is required", function (value) {
               return Boolean(value)
            }),
      }),
   })

const validateEmailUniqueness = debounce(
   async (groupId: string, value: string) => {
      if (!value) {
         return true // If the value is undefined or null, it's considered valid here, because we have `.required` above
      }
      try {
         const isUnique = await groupRepo.creatorEmailIsUnique(groupId, value)
         return isUnique // The server should respond with a boolean indicating if the email is unique
      } catch (error) {
         // Handle error appropriately in your app
         return false // If the server request fails, we can consider the validation to have failed
      }
   },
   400
) // 400ms debounce

export default CreateCreatorView
