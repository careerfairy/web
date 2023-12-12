import SteppedDialog, {
   useStepper,
} from "../../../../stepped-dialog/SteppedDialog"
import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
import React, { useCallback, useMemo } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import { AlertTriangle } from "react-feather"
import Stack from "@mui/material/Stack"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "../../../../../../data/RepositoryInstances"
import { Form, Formik } from "formik"
import { BrandedTextFieldField } from "../../../../common/inputs/BrandedTextField"
import * as Yup from "yup"

const styles = sxStyles({
   wrapContainer: {
      height: {
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      my: { xs: 1, md: "80px" },
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   title: {
      fontSize: { xs: "20px", md: "24px" },
   },
   input: {
      width: "100%",
      mt: 4,
   },
})

const PrivacyPolicyDialog = () => {
   const { group } = useGroupFromState()
   const { moveToNext } = useStepper()
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
            await groupRepo.updateGroupMetadata(group.groupId, privacyPolicy)
            successNotification("Privacy policy successfully updated")
         } catch (error) {
            errorNotification(error, "An error has occurred")
         } finally {
            moveToNext()
         }
      },
      [group.groupId, successNotification, errorNotification, moveToNext]
   )

   const handleSkip = useCallback(() => {
      moveToNext()
   }, [moveToNext])

   return (
      <Formik<FormValues>
         initialValues={initialValues}
         onSubmit={handleSubmit}
         validationSchema={validationSchema}
         enableReinitialize
      >
         {({ dirty, handleSubmit, isSubmitting, isValid }) => (
            <SteppedDialog.Container
               containerSx={styles.content}
               sx={styles.wrapContainer}
               withActions
            >
               <>
                  <SteppedDialog.Content sx={styles.container}>
                     <Stack spacing={3} sx={styles.info}>
                        <AlertTriangle color={"#FE9B0E"} size={68} />

                        <SteppedDialog.Title sx={styles.title}>
                           Add your privacy policy
                        </SteppedDialog.Title>

                        <SteppedDialog.Subtitle maxWidth={"unset"}>
                           Unlock access to job applicants! To view applicants
                           for your job openings, you are required to add a link
                           to your company's privacy policy in your company
                           profile.
                        </SteppedDialog.Subtitle>

                        <SteppedDialog.Subtitle maxWidth={"unset"}>
                           This not only ensures the privacy and security of our
                           talent community's data but also builds trust with
                           potential candidates.
                        </SteppedDialog.Subtitle>
                     </Stack>

                     <Form>
                        <BrandedTextFieldField
                           label="Link to privacy policy"
                           name="privacyPolicyUrl"
                           placeholder="Insert privacy policy URL link"
                           sx={styles.input}
                        />
                     </Form>
                  </SteppedDialog.Content>

                  <SteppedDialog.Actions>
                     <SteppedDialog.Button
                        variant="outlined"
                        color="grey"
                        onClick={handleSkip}
                     >
                        Skip
                     </SteppedDialog.Button>

                     <SteppedDialog.Button
                        variant="contained"
                        color={"secondary"}
                        disabled={isSubmitting || !isValid || !dirty}
                        type="submit"
                        onClick={() => handleSubmit()}
                        loading={isSubmitting}
                     >
                        Next
                     </SteppedDialog.Button>
                  </SteppedDialog.Actions>
               </>
            </SteppedDialog.Container>
         )}
      </Formik>
   )
}

type FormValues = {
   privacyPolicyActive: boolean
   privacyPolicyUrl: string
}

const validationSchema: Yup.SchemaOf<FormValues> = Yup.object().shape({
   privacyPolicyActive: Yup.boolean(),
   privacyPolicyUrl: Yup.string().url("Invalid URL").required("Required field"),
})

export default PrivacyPolicyDialog
