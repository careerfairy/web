import { GroupOption } from "@careerfairy/shared-lib/groups"
import { GROUP_CONSTANTS } from "@careerfairy/shared-lib/groups/constants"
import { LoadingButton } from "@mui/lab"
import { Box, Stack } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import BrandedAutocomplete from "components/views/common/inputs/BrandedAutocomplete"
import {
   BrandedTextFieldField,
   BrandedTextFieldProps,
} from "components/views/common/inputs/BrandedTextField"
import {
   CompanyCountryValues,
   CompanyIndustryValues,
   CompanySizesCodes,
} from "constants/forms"
import { groupRepo } from "data/RepositoryInstances"
import { Form, Formik, FormikErrors, FormikTouched } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"
import SectionComponent from "./SectionComponent"

const styles = sxStyles({
   chipInput: {
      "& .MuiFilledInput-root": {
         pb: 1,
         pt: 3,
      },
      "& .MuiChip-root": {
         backgroundColor: "secondary.main",
         color: "white",
         m: 0.625,
         "& svg": {
            color: "inherit",
         },
      },
   },
   saveBtn: {
      textTransform: "none",
   },
})

const [title, description] = [
   "Details",
   `Share information about your company to the next generation of
   talent. This information will be visible on your company profile,
   as well as your live streams, and can be edited at any time.`,
]

const CompanyDetails = () => {
   const { group } = useGroup()
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const initialValues = useMemo<FormValues>(
      () => ({
         universityName: group.universityName ?? "",
         careerPageUrl: group.careerPageUrl ?? "",
         extraInfo: group.extraInfo ?? "",
         companyCountry: group.companyCountry ?? null,
         companyIndustries: group.companyIndustries ?? [],
         companySize: group.companySize ?? null,
      }),
      [
         group.universityName,
         group.companyCountry,
         group.companyIndustries,
         group.companySize,
         group.careerPageUrl,
         group.extraInfo,
      ]
   )

   const handleSubmit = useCallback(
      async (values: FormValues) => {
         try {
            await groupRepo.updateGroupMetadata(group.id, values)

            successNotification(
               "Your company details were successfully updated"
            )
         } catch (e) {
            errorNotification(e, "Failed to updated your data")
         }
      },
      [errorNotification, successNotification, group.id]
   )

   return (
      <SectionComponent title={title} description={description}>
         <Formik<FormValues>
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
         >
            {({
               values,
               dirty,
               isSubmitting,
               setFieldValue,
               errors,
               handleBlur,
               touched,
            }) => (
               <Form>
                  <Stack spacing={1.5}>
                     <BrandedTextFieldField
                        name="universityName"
                        label="Company name"
                        placeholder="E.g., CareerFairy"
                     />
                     <BrandedTextFieldField
                        name="careerPageUrl"
                        label="Career page URL"
                        placeholder="E.g., company.io/careers"
                     />
                     <BrandedTextFieldField
                        name="extraInfo"
                        multiline
                        rows={4}
                        label="Describe your company"
                        placeholder="E.g., Briefly describe your company's mission, products/services, and target audience"
                     />
                     <BrandedAutocomplete
                        id={"companyCountry"}
                        options={CompanyCountryValues}
                        defaultValue={values.companyCountry}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) =>
                           option.id === value.id
                        }
                        value={values.companyCountry}
                        disableClearable
                        textFieldProps={getTextFieldProps(
                           "Company location",
                           "companyCountry",
                           touched,
                           errors
                        )}
                        onChange={(_, selected) =>
                           setFieldValue("companyCountry", selected)
                        }
                     />

                     <BrandedAutocomplete
                        id={"companyIndustries"}
                        options={CompanyIndustryValues}
                        defaultValue={values.companyIndustries}
                        isOptionEqualToValue={(option, value) =>
                           option.id === value.id
                        }
                        getOptionLabel={(option) => option.name || ""}
                        value={values.companyIndustries ?? []}
                        multiple
                        limit={GROUP_CONSTANTS.MAX_INDUSTRY_COUNT}
                        disableCloseOnSelect
                        sx={styles.chipInput}
                        textFieldProps={getTextFieldProps(
                           "Company industries",
                           "companyIndustries",
                           touched,
                           errors
                        )}
                        onChange={(_, selected) => {
                           setFieldValue("companyIndustries", selected)
                        }}
                     />

                     <BrandedAutocomplete
                        id={"companySize"}
                        options={CompanySizesCodes}
                        defaultValue={values.companySize}
                        getOptionLabel={(option) => option.label || ""}
                        value={values.companySize}
                        isOptionEqualToValue={(option, value) =>
                           option.id === value.id
                        }
                        onBlur={handleBlur}
                        disableClearable
                        onChange={(_, selected) => {
                           setFieldValue("companySize", selected)
                        }}
                        textFieldProps={getTextFieldProps(
                           "Company size",
                           "companySize",
                           touched,
                           errors
                        )}
                     />
                     <Box display="flex" justifyContent="flex-end">
                        <LoadingButton
                           loading={isSubmitting}
                           disabled={!dirty || isSubmitting}
                           type="submit"
                           size="small"
                           sx={styles.saveBtn}
                           variant="contained"
                           color="secondary"
                        >
                           Save changes
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
   universityName: string
   companyCountry: GroupOption | null
   companyIndustries: GroupOption[] | null
   companySize: string
   careerPageUrl: string
   extraInfo: string
}

const validationSchema: Yup.SchemaOf<FormValues> = Yup.object().shape({
   universityName: Yup.string().required("Company name is required"),
   companyCountry: Yup.object()
      .shape({
         id: Yup.string().required(),
         name: Yup.string().required(),
      })
      .required("Company country is required"),
   companyIndustries: Yup.array()
      .of(
         Yup.object().shape({
            id: Yup.string().required(),
            name: Yup.string().required(),
         })
      )
      .nullable()
      .max(GROUP_CONSTANTS.MAX_INDUSTRY_COUNT, "Maximum of 5 industries")
      .required("At least one industry is required"),
   companySize: Yup.object()
      .shape({
         id: Yup.string().required(),
         label: Yup.string().required(),
      })
      .nullable()
      .required("Company size is required"),
   extraInfo: Yup.string()
      .min(GROUP_CONSTANTS.MIN_EXTRA_INFO_LENGTH)
      .max(GROUP_CONSTANTS.MAX_EXTRA_INFO_LENGTH),
   careerPageUrl: Yup.string().url("Invalid career page URL").nullable(),
})

const getTextFieldProps = (
   label: string,
   name: keyof FormValues,
   touched: FormikTouched<FormValues>,
   errors: FormikErrors<FormValues>
): BrandedTextFieldProps => ({
   label,
   error: touched[name] && Boolean(errors[name]),
   helperText: touched[name] && errors[name],
})

export default CompanyDetails
