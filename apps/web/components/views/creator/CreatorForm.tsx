import { Creator, PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import {
   CreateCreatorSchema,
   CreateCreatorSchemaType,
} from "@careerfairy/shared-lib/groups/schemas"
import { Grid } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { EMAIL_TOOLTIP_INFO } from "constants/pages"
import React, { ReactNode, useMemo } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import { ControlledAvatarUpload } from "../common/inputs/ControlledAvatarUpload"
import { ControlledBrandedTextField } from "../common/inputs/ControlledBrandedTextField"
import { getInitialValues } from "../sparks/forms/CreateOrEditCreatorForm"

const styles = sxStyles({
   avatarGrid: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 1,
   },
})

type FormProviderProps = {
   creator?: Creator | PublicCreator
   hideEmailField?: boolean
   children:
      | ((methods: UseFormReturn<CreateCreatorSchemaType>) => ReactNode)
      | ReactNode
}

// Create a context to pass the isAdhocSpeaker value down
type CreatorFormContextType = {
   hideEmailField: boolean
}

const CreatorFormContext = React.createContext<CreatorFormContextType>({
   hideEmailField: false,
})

export const useCreatorForm = () => React.useContext(CreatorFormContext)

export const CreatorFormProvider = ({
   children,
   creator,
   hideEmailField = false,
}: FormProviderProps) => {
   // For adhoc speakers, we modify the schema to make email optional
   const modifiedSchema = useMemo(() => {
      if (hideEmailField) {
         // Create a modified schema with email field optional
         return CreateCreatorSchema.clone().shape({
            email: yup.string().notRequired(),
         })
      }
      return CreateCreatorSchema
   }, [hideEmailField])

   const methods = useYupForm({
      schema: modifiedSchema,
      defaultValues: getInitialValues(creator),
      mode: "onChange",
      reValidateMode: "onChange",
   })

   const contextValue = useMemo(
      () => ({
         hideEmailField,
      }),
      [hideEmailField]
   )

   return (
      <CreatorFormContext.Provider value={contextValue}>
         <FormProvider {...methods}>
            {typeof children === "function" ? children(methods) : children}
         </FormProvider>
      </CreatorFormContext.Provider>
   )
}

export const CreatorFormFields = () => {
   const {
      formState: { defaultValues },
   } = useFormContext<CreateCreatorSchemaType>()
   const { hideEmailField } = useCreatorForm()

   const isEditing = Boolean(defaultValues.id)

   return (
      <Grid container spacing={2}>
         <Grid sx={styles.avatarGrid} item xs={12}>
            <ControlledAvatarUpload
               fileFieldName="avatarFile"
               urlFieldName="avatarUrl"
            />
         </Grid>
         <Grid item xs={12} sm={6}>
            <ControlledBrandedTextField
               name="firstName"
               type="text"
               label="First name"
               placeholder="John"
               fullWidth
               requiredText={"(required)"}
            />
         </Grid>
         <Grid item xs={12} sm={6}>
            <ControlledBrandedTextField
               name="lastName"
               type="text"
               label="Last name"
               placeholder="Doe"
               fullWidth
               requiredText={"(required)"}
            />
         </Grid>
         <Grid item xs={12} sm={6}>
            <ControlledBrandedTextField
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
            <ControlledBrandedTextField
               name="linkedInUrl"
               type="text"
               label="LinkedIn link"
               placeholder="E.g.,: https://linkedin.com/in/user"
               autoComplete="url"
               fullWidth
               tooltipText="Add your LinkedIn profile to connect with more qualified candidates."
            />
         </Grid>
         {hideEmailField ? null : (
            <Grid item xs={12}>
               <ControlledBrandedTextField
                  name="email"
                  type="text"
                  label="Email address"
                  placeholder="E.g.,: John@careerfairy.io"
                  disabled={isEditing} // if we are editing a creator, we don't want to allow changing the email
                  fullWidth
                  requiredText={"(required)"}
                  tooltipText={EMAIL_TOOLTIP_INFO}
               />
            </Grid>
         )}
         <Grid item xs={12}>
            <ControlledBrandedTextField
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
   )
}
