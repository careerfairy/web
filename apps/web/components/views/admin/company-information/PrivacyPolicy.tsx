import React, { useCallback, useMemo, useState } from "react"
import { Button, Container, Grid, Stack, Typography } from "@mui/material"
import { Box } from "@mui/system"

import Styles from "./BaseStyles"
import FilePickerContainer from "components/ssr/FilePickerContainer"
import { BaseGroupInfo } from "pages/group/create"
import { Form, Formik } from "formik"
import * as yup from "yup"
import SaveChangesButton from "./SaveChangesButton"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "data/RepositoryInstances"

const schema = yup.object().shape({
   logoUrl: yup.string().trim().required("URL is required").url("Invalid URL"),
   logoFileObj: yup.mixed().required("Image file is required"),
})

const PrivacyPolicy = () => {
   const { group } = useGroup()
   const initialValues = useMemo(
      () => ({
         privacyPolicyActive: group.privacyPolicyActive,
         privacyPolicyUrl: group.privacyPolicyUrl,
      }),
      [group.privacyPolicyActive, group.privacyPolicyUrl]
   )

   const handleSubmit = (values) => {
      try {
         const privacyPolicy: Pick<
            Group,
            "privacyPolicyActive" | "privacyPolicyUrl"
         > = {
            privacyPolicyActive: Boolean(values.privacyPolicyUrl),
            privacyPolicyUrl: values.privacyPolicyUrl,
         }
         groupRepo.updateGroupMetadata(group.id, { ...privacyPolicy })
      } catch (error) {
         console.log(error)
      }
   }

   return (
      <Box sx={Styles.section}>
         <div className="section-left_column">
            <h3>Privacy policy</h3>
            <p>
               Adding a privacy policy allows you to see live stream
               participants and registration details. It will be agreed during
               the registration process.
            </p>
         </div>
         <Formik
            initialValues={initialValues}
            onSubmit={async (values) => {
               try {
                  const privacyPolicy: Pick<
                     Group,
                     "privacyPolicyActive" | "privacyPolicyUrl"
                  > = {
                     privacyPolicyActive: Boolean(values.privacyPolicyUrl),
                     privacyPolicyUrl: values.privacyPolicyUrl,
                  }
                  groupRepo.updateGroupMetadata(group.id, { ...privacyPolicy })
               } catch (error) {
                  console.log(error)
               }
            }}
         >
            {({
               values,
               errors,
               touched,
               handleChange,
               handleBlur,
               handleSubmit,
               isSubmitting,
               setFieldValue,
               setFieldError,
            }) => (
               <Form>
                  <Box>
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
                        <SaveChangesButton type="submit">
                           Save
                        </SaveChangesButton>
                     </Stack>
                  </Box>
               </Form>
            )}
         </Formik>
      </Box>
   )
}

export default PrivacyPolicy
