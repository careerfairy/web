import {
   Creator,
   CreatorRole,
   CreatorRoles,
   PublicCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { CreateCreatorSchema } from "@careerfairy/shared-lib/groups/schemas"
import { Grid } from "@mui/material"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import { EMAIL_TOOLTIP_INFO } from "constants/pages"
import { Form, Formik } from "formik"
import { FC, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import useCreatorFormSubmit, {
   CreatorFormValues,
} from "./hooks/useCreatorFormSubmit"
import AvatarUpload from "./inputs/AvatarUpload"

const styles = sxStyles({
   avaGrid: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 1,
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
   actions?: ReactNode
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
                        remoteUrl={creator?.avatarUrl}
                     />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <FormBrandedTextField
                        name="firstName"
                        type="text"
                        label="First Name"
                        placeholder="John"
                        fullWidth
                        requiredText={"(required)"}
                     />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <FormBrandedTextField
                        name="lastName"
                        type="text"
                        label="Last Name"
                        placeholder="Doe"
                        fullWidth
                        requiredText={"(required)"}
                     />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <FormBrandedTextField
                        name="position"
                        type="text"
                        label="Position"
                        placeholder="E.g.,: Marketing Manager"
                        autoComplete="organization-title"
                        fullWidth
                        requiredText={"(required)"}
                     />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <FormBrandedTextField
                        name="linkedInUrl"
                        type="text"
                        label="LinkedIn Link"
                        placeholder="E.g.,: linkedin.com/in/user"
                        autoComplete="url"
                        fullWidth
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <FormBrandedTextField
                        name="email"
                        type="text"
                        label="Email address"
                        placeholder="E.g.,: John@careerfairy.io"
                        disabled={Boolean(values.id)} // if we are editing a creator, we don't want to allow changing the email
                        fullWidth
                        requiredText={"(required)"}
                        tooltipText={EMAIL_TOOLTIP_INFO}
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <FormBrandedTextField
                        name="story"
                        type="text"
                        label="Personal story"
                        placeholder="Tell talent a little more about your story and professional background!"
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

const getInitialRolesValues = (
   creator?: Creator | PublicCreator
): CreatorRole[] => {
   if (!creator || creator?.roles?.length === 0) {
      return [CreatorRoles.Spark]
   }
   const hasSparkRole = creator.roles?.includes(CreatorRoles.Spark)
   return hasSparkRole ? creator.roles : [...creator.roles, CreatorRoles.Spark]
}

export const getInitialValues = (
   creator?: Creator | PublicCreator
): CreatorFormValues => ({
   avatarUrl: creator?.avatarUrl || "",
   avatarFile: null,
   firstName: creator?.firstName || "",
   lastName: creator?.lastName || "",
   position: creator?.position || "",
   linkedInUrl: creator?.linkedInUrl || "",
   story: creator?.story || "",
   id: creator?.id || "",
   email: "email" in creator ? creator.email : "",
   roles: getInitialRolesValues(creator),
})

export default CreateOrEditCreatorForm
