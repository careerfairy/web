import { Group } from "@careerfairy/shared-lib/groups"
import { LoadingButton } from "@mui/lab"
import { Box, Stack } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { groupRepo } from "data/RepositoryInstances"
import { Form, Formik } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import React, { useCallback, useMemo } from "react"
import { Save } from "react-feather"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"
import SectionComponent from "./SectionComponent"

const styles = sxStyles({
   btn: {
      textTransform: "none",
   },
   input: {
      mb: 1.5,
   },
})

const [title, description] = [
   "Privacy policy",
   `Adding a privacy policy allows you to see live stream
   participants and registration details. It will be agreed during
   the registration process.`,
]

const PrivacyPolicy = () => {
   const { group } = useGroup()

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const initialValues = useMemo(
      () => ({
         privacyPolicyActive: group.privacyPolicyActive,
         privacyPolicyUrl: group.privacyPolicyUrl,
      }),
      [group.privacyPolicyActive, group.privacyPolicyUrl]
   )

   const handleSubmit = useCallback(
      async (values: FormValues) => {
         try {
            const privacyPolicy: Pick<
               Group,
               "privacyPolicyActive" | "privacyPolicyUrl"
            > = {
               privacyPolicyActive: Boolean(values.privacyPolicyUrl),
               privacyPolicyUrl: values.privacyPolicyUrl,
            }
            groupRepo.updateGroupMetadata(group.id, privacyPolicy)
            successNotification("Privacy policy successfull updated")
         } catch (error) {
            errorNotification(error, "An error has occured")
         }
      },
      [group.id, errorNotification, successNotification]
   )

   return (
      <SectionComponent title={title} description={description}>
         <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            enableReinitialize
         >
            {({ dirty, handleSubmit, isSubmitting, errors }) => (
               <Form>
                  <Stack>
                     <BrandedTextFieldField
                        label="Link to privacy policy"
                        name="privacyPolicyUrl"
                        placeholder="Insert privacy policy URL link"
                        sx={styles.input}
                     />
                     <Box display="flex" justifyContent="flex-end">
                        <LoadingButton
                           endIcon={<Save />}
                           loading={isSubmitting}
                           disabled={!dirty}
                           onClick={() => handleSubmit()}
                           size="small"
                           variant="contained"
                           color="secondary"
                           sx={styles.btn}
                        >
                           Save Policy
                        </LoadingButton>
                     </Box>
                  </Stack>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

type FormValues = {
   privacyPolicyActive: boolean
   privacyPolicyUrl: string
}

const validationSchema: Yup.SchemaOf<FormValues> = Yup.object().shape({
   privacyPolicyActive: Yup.boolean(),
   privacyPolicyUrl: Yup.string().url("Invalid URL"),
})

export default PrivacyPolicy
