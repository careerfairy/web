import React, { useMemo } from "react"
import { Stack } from "@mui/material"
import { Box } from "@mui/system"

import Styles from "./BaseStyles"
import { Form, Formik } from "formik"
import SaveChangesButton from "./SaveChangesButton"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "data/RepositoryInstances"
import LeftColumn from "./LeftColumn"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import SectionComponent from "./SectionComponent"

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

   const handleSubmit = async (values) => {
      try {
         const privacyPolicy: Pick<
            Group,
            "privacyPolicyActive" | "privacyPolicyUrl"
         > = {
            privacyPolicyActive: Boolean(values.privacyPolicyUrl),
            privacyPolicyUrl: values.privacyPolicyUrl,
         }
         groupRepo.updateGroupMetadata(group.id, { ...privacyPolicy })
         successNotification("Privacy policy successfull updated")
      } catch (error) {
         errorNotification(error, "An error has occured")
      }
   }

   const [title, description] = [
      "Privacy policy",
      `Adding a privacy policy allows you to see live stream
      participants and registration details. It will be agreed during
      the registration process.`,
   ]
   return (
      <SectionComponent title={title} description={description}>
         <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ values, dirty, setFieldValue }) => (
               <Form>
                  <Stack>
                     <BrandedTextField
                        label="Link to privacy policy"
                        placeholder="Insert privacy policy URL link"
                        value={values.privacyPolicyUrl}
                        onChange={(e) =>
                           setFieldValue("privacyPolicyUrl", e.target.value)
                        }
                        sx={{ mb: "12px" }}
                     ></BrandedTextField>
                     <SaveChangesButton type="submit" active={dirty}>
                        Save Policy
                     </SaveChangesButton>
                  </Stack>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

export default PrivacyPolicy
