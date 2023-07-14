import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Avatar, Box, CardActionArea, Grid, Typography } from "@mui/material"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { Form, Formik, useField } from "formik"
import { FC, Fragment, useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import CameraIcon from "@mui/icons-material/PhotoCameraOutlined"
import useUploadCreatorAvatar from "components/custom-hook/creator/useUploadCreatorAvatar"
import { useGroup } from "layouts/GroupDashboardLayout"
import FileUploader from "components/views/common/FileUploader"

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
})

type CreateCreatorFormValues = Pick<
   Creator,
   | "firstName"
   | "lastName"
   | "position"
   | "email"
   | "avatarUrl"
   | "linkedInUrl"
   | "story"
> & {
   avatarFile: File | null
}

const initialValues: CreateCreatorFormValues = {
   firstName: "",
   lastName: "",
   position: "",
   email: "",
   avatarUrl: "",
   linkedInUrl: "",
   story: "",
   avatarFile: null,
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
   avatarUrl: yup.string().required("Avatar URL is required"),
   linkedInUrl: yup.string().url().required("LinkedIn URL is required"),
   story: yup.string().max(500, "Story must be less than 500 characters"),

   avatarFile: yup.mixed<File>().when("avatarUrl", {
      is: (avatarUrl: string) => !avatarUrl,
      then: yup.mixed().required("Avatar is required"),
   }),
})

const CreateCreatorView = () => {
   const { setCreator, stepper } = useSparksForm()
   const { group } = useGroup()

   const handleBack = useCallback(
      (callback?: () => void) => {
         setCreator(null)
         stepper.goToStep("select-creator")
         callback?.()
      },
      [setCreator, stepper]
   )

   return (
      <SparksDialog.Container withActionsOffset sx={styles.root}>
         <SparksDialog.Title>
            Create a new{" "}
            <Box component="span" color="secondary.main">
               profile
            </Box>
         </SparksDialog.Title>
         <SparksDialog.Subtitle>
            Insert your new creator details!
         </SparksDialog.Subtitle>
         <Box mt={5} />
         <Formik
            initialValues={initialValues}
            validationSchema={CreateCreatorSchema}
            onSubmit={(values, { setSubmitting }) => {}}
         >
            {({ submitForm, isSubmitting, dirty, isValid, resetForm }) => (
               <Form>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <AvatarUpload name="avatarFile" groupId={group.id} />
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
                        Create
                     </SparksDialog.Button>
                  </SparksDialog.Actions>
               </Form>
            )}
         </Formik>
      </SparksDialog.Container>
   )
}

type AvatarUploadProps = {
   groupId: string
   name?: string
}

const AvatarUpload: FC<AvatarUploadProps> = ({ groupId, name }) => {
   const [field, meta, helpers] = useField<File>(name)
   const {
      fileUploaderProps,
      avatarUploaded,
      isLoading,
      dragActive,
      progress,
      uploading,
   } = useUploadCreatorAvatar(groupId, (file) => {
      helpers.setValue(file)
   })

   const blobUrl = useMemo(() => {
      console.log(
         "🚀 ~ file: CreateCreatorView.tsx:246 ~ blobUrl ~ field.value:",
         field.value
      )
      if (field.value) {
         return URL.createObjectURL(field.value)
      }
   }, [field.value])

   return (
      <FileUploader {...fileUploaderProps}>
         <CardActionArea sx={styles.avaRoot}>
            <Avatar
               src={blobUrl}
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
   )
}

export default CreateCreatorView
