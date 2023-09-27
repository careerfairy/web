import React, { Dispatch, useCallback, useMemo } from "react"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import useGroupATSAccounts from "../../../custom-hook/useGroupATSAccounts"
import Section from "components/views/common/Section"
import ATSFormSection from "./ATSFormSection"
import JobsInfoSection from "./JobsInfoSection"
import { FormikErrors, FormikTouched, FormikValues } from "formik"
import { ICustomJobObj } from "../DraftStreamForm"
import {
   handleAddSection,
   handleErrorSection,
} from "../../../helperFunctions/streamFormFunctions"
import FormGroup from "../FormGroup"
import { Box, Button, Grid, Typography } from "@mui/material"
import { PlusCircle } from "react-feather"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   addJob: {
      borderRadius: "10px",
      height: (theme) => theme.spacing(10),
      border: "dashed",
      borderColor: (theme) => theme.palette.grey.A400,

      "&:hover": {
         border: "dashed",
      },
   },
})

type Props = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
   sectionRef: any
   classes: any
   customJobObj: ICustomJobObj
   values: FormikValues
   setValues: (values: any) => void
   errors: FormikErrors<FormikValues>
   touched: FormikTouched<FormikValues>
   setFieldValue: (field: string, value: any) => void
   isSubmitting: boolean
   handleBlur: (e) => void
}

/**
 * Display the job selector if the Group has any ATS account linked with
 * the first sync complete
 *
 * It will fetch all jobs from all accounts
 *
 * @param groupId
 * @param onSelectItems
 * @param selectedItems
 * @param sectionRef
 * @param classes
 * @param customJobObj
 * @param values
 * @param setValues
 * @param errors
 * @param touched
 * @param setFieldValue
 * @param isSubmitting
 * @param handleBlur
 * @constructor
 */
const JobSelectorCategory = ({
   groupId,
   onSelectItems,
   selectedItems,
   sectionRef,
   classes,
   customJobObj,
   values,
   setValues,
   errors,
   touched,
   setFieldValue,
   isSubmitting,
   handleBlur,
}: Props) => {
   const { data: accounts } = useGroupATSAccounts(groupId)

   // TODO tO be uncomment
   // First sync should be complete to fetch the jobs
   // const filteredAccounts = useMemo(() => {
   //    return accounts.filter((account) => account.firstSyncCompletedAt)
   // }, [accounts])

   // // Only display the selector if the Group has ATS accounts linked with first sync complete
   // if (filteredAccounts.length === 0) {
   //    return null
   // }

   const filteredAccounts = []

   const renderJobSection = useCallback(() => {
      return (
         <>
            <Box>
               <Typography fontWeight="bold" variant="h4">
                  Jobs
               </Typography>
               <Typography variant="subtitle1" mt={1} color="textSecondary">
                  Create and insert all job openings that you want to share with
                  the talent community!
               </Typography>
            </Box>

            <FormGroup container boxShadow={0} spacing={4}>
               {Object.keys(values.customJobs).map((key, index) => (
                  <JobsInfoSection
                     key={key}
                     index={index}
                     setValues={setValues}
                     objectKey={key}
                     titleError={handleErrorSection(
                        "customJob",
                        key,
                        "title",
                        errors,
                        touched
                     )}
                     salaryError={handleErrorSection(
                        "customJob",
                        key,
                        "salary",
                        errors,
                        touched
                     )}
                     descriptionError={handleErrorSection(
                        "customJob",
                        key,
                        "description",
                        errors,
                        touched
                     )}
                     deadlineError={handleErrorSection(
                        "customJob",
                        key,
                        "deadline",
                        errors,
                        touched
                     )}
                     urlError={handleErrorSection(
                        "customJob",
                        key,
                        "url",
                        errors,
                        touched
                     )}
                     jobTypeError={handleErrorSection(
                        "customJob",
                        key,
                        "jobType",
                        errors,
                        touched
                     )}
                     job={values.customJobs[key]}
                     values={values}
                     setFieldValue={setFieldValue}
                     isSubmitting={isSubmitting}
                     handleBlur={handleBlur}
                  />
               ))}

               <Grid xs={12} item>
                  <Button
                     startIcon={<PlusCircle height={18} />}
                     disabled={isSubmitting}
                     onClick={() =>
                        handleAddSection(
                           "customJobs",
                           values,
                           setValues,
                           customJobObj
                        )
                     }
                     type="button"
                     color="secondary"
                     variant="outlined"
                     sx={styles.addJob}
                     size="large"
                     fullWidth
                  >
                     Add a Job opening
                  </Button>
               </Grid>
            </FormGroup>
         </>
      )
   }, [
      customJobObj,
      errors,
      handleBlur,
      isSubmitting,
      setFieldValue,
      setValues,
      touched,
      values,
   ])

   return (
      <Section
         sectionRef={sectionRef}
         sectionId={"JobSection"}
         className={classes.section}
      >
         {filteredAccounts.length ? (
            <ATSFormSection
               groupId={groupId}
               accounts={filteredAccounts}
               selectedItems={selectedItems}
               onSelectItems={onSelectItems}
            />
         ) : (
            renderJobSection()
         )}
      </Section>
   )
}

export default JobSelectorCategory
