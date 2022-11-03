import { Grid, Typography } from "@mui/material"
import FormGroup from "../FormGroup"
import MultiListSelect from "../../common/MultiListSelect"
import React, { MutableRefObject } from "react"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import Section from "components/views/common/Section"
import { FormikErrors, FormikValues } from "formik"
import { FormikTouched } from "formik/dist/types"

type Props = {
   setSelectedInterests: React.Dispatch<React.SetStateAction<Interest[]>>
   selectedInterests: Interest[]
   existingInterests: Interest[]
   isSubmitting: boolean
   setFieldValue: (field, value) => void
   sectionRef: MutableRefObject<any>
   classes: any
   errors: FormikErrors<FormikValues>
   touched: FormikTouched<FormikValues>
   handleBlur: (e) => void
}

const EventCategoriesInfo = ({
   setSelectedInterests,
   selectedInterests,
   existingInterests,
   isSubmitting,
   setFieldValue,
   sectionRef,
   classes,
   errors,
   touched,
   handleBlur,
}: Props) => {
   return (
      <Section
         sectionRef={sectionRef}
         sectionId={"eventCategorySection"}
         className={classes.section}
      >
         <Typography fontWeight="bold" variant="h4">
            Event Categories
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Add categories that related to this event
         </Typography>
         <FormGroup container boxShadow={0}>
            <Grid xs={12} item>
               <MultiListSelect
                  inputName="interestsIds"
                  onSelectItems={setSelectedInterests}
                  selectedItems={selectedInterests}
                  allValues={existingInterests}
                  disabled={isSubmitting}
                  limit={5}
                  setFieldValue={setFieldValue}
                  inputProps={{
                     label: "Event Categories",
                     placeholder:
                        "Choose 5 categories that best describe this event",
                  }}
                  chipProps={{
                     variant: "contained",
                     color: "secondary",
                  }}
                  isCheckbox
                  checkboxColor="secondary"
                  hasError={Boolean(
                     errors.interestsIds && touched.interestsIds
                  )}
                  errorMessage={errors.interestsIds as string}
                  handleBlur={handleBlur}
                  errorMessageClassName={classes.errorMessage}
               />
            </Grid>
         </FormGroup>
      </Section>
   )
}
export default EventCategoriesInfo
