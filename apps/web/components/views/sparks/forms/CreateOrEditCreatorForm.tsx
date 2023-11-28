import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Form, Formik } from "formik"
import React, { FC, ReactNode } from "react"
import useCreatorFormSubmit, {
   CreatorFormValues,
} from "./hooks/useCreatorFormSubmit"
import { Box, Grid, Tooltip } from "@mui/material"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import CreateCreatorSchema from "./schemas/CreateCreatorSchema"
import { sxStyles } from "types/commonTypes"
import AvatarUpload from "./inputs/AvatarUpload"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { EMAIL_TOOLTIP_INFO } from "constants/pages"

const styles = sxStyles({
   avaGrid: {
      display: "flex",
      justifyContent: "center",
   },
})

type Props = {
   /**
    * If we are editing a creator, we need to pass in the creator object
    * Otherwise, we are creating a new creator
    */
   creator?: Creator
   /**
    * The id of the group that this creator belongs to
    */
   groupId: string
   /**
    * The actions to be displayed at the bottom of the form
    */
   actions: ReactNode
   /**
    * The callback to be invoked when the form is successfully submitted
    */
   onSuccessfulSubmit: (creator: Creator) => void
}

const CreateOrEditCreatorForm: FC<Props> = ({
   creator,
   groupId,
   actions,
   onSuccessfulSubmit,
}) => {
   const { handleSubmit } = useCreatorFormSubmit(groupId, onSuccessfulSubmit)

   return (
      <Formik
         initialValues={getInitialValues(creator)}
         validationSchema={CreateCreatorSchema}
         enableReinitialize
         onSubmit={handleSubmit}
      >
         {({ values }) => (
            <Form>
               <Grid container spacing={2}>
                  <Grid sx={styles.avaGrid} item xs={12}>
                     <AvatarUpload
                        name="avatarFile"
                        groupId={groupId}
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
                        disabled={Boolean(values.id)} // if we are editing a creator, we don't want to allow changing the email
                        fullWidth
                        InputProps={{
                           endAdornment: (
                              <Tooltip
                                 color={"secondary"}
                                 title={EMAIL_TOOLTIP_INFO}
                              >
                                 <InfoIcon />
                              </Tooltip>
                           ),
                        }}
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
               {actions}
            </Form>
         )}
      </Formik>
   )
}

const getInitialValues = (creator?: Creator): CreatorFormValues => ({
   avatarUrl: creator?.avatarUrl || "",
   avatarFile: null,
   firstName: creator?.firstName || "",
   lastName: creator?.lastName || "",
   position: creator?.position || "",
   linkedInUrl: creator?.linkedInUrl || "",
   story: creator?.story || "",
   email: creator?.email || "",
   id: creator?.id || "",
})

export default CreateOrEditCreatorForm
