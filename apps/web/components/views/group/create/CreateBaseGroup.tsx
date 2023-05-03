import React, { useCallback, useEffect, useMemo, useState } from "react"
import PublishIcon from "@mui/icons-material/Publish"
import { Form as UiForm, Formik } from "formik"
import FilePickerContainer from "../../../../components/ssr/FilePickerContainer"
import {
   Box,
   Button,
   Collapse,
   Container,
   FormControl,
   FormControlLabel,
   FormHelperText,
   TextField,
   Typography,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import * as yup from "yup"
import {
   University,
   universityCountryMap,
} from "@careerfairy/shared-lib/dist/universities"
import { universityRepo } from "../../../../data/RepositoryInstances"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"
import VirtualizedAutocomplete from "../../common/VirtualizedAutocomplete"
import Stack from "@mui/material/Stack"
import { BaseGroupInfo } from "../../../../pages/group/create"
import Checkbox from "@mui/material/Checkbox"
import CompanyMetadata from "./CompanyMetadata"
import { scrollTop } from "../../../../util/CommonUtil"

const placeholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"

const useStyles = makeStyles(() => ({
   root: {
      paddingTop: "50px",
      paddingBottom: "50px",
   },
   title: {
      fontWeight: "300",
      color: "rgb(0, 210, 170)",
      fontSize: "calc(1.2em + 1.5vw)",
   },
   image: {
      margin: "20px auto 20px auto",
      maxWidth: "100%",
      maxHeight: "250px",
   },
   form: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
      width: "100%",
   },
}))

const schema = yup.object().shape({
   universityName: yup
      .string()
      .max(60, "Must be 60 characters or less")
      .required("Required"),
   description: yup
      .string()
      .max(60, "Must be 60 characters or less")
      .required("Required"),
   logoFileObj: yup.mixed().required("Image file is required"),
   isUniversity: yup.boolean(),
   university: yup
      .object()
      .nullable()
      .when("isUniversity", {
         is: true,
         then: yup.object().required("Select a university").nullable(),
      }),
})

export interface GroupedUniversity extends University {
   countryName: string
}

interface CreateGroupProps {
   handleNext: () => void
   setBaseGroupInfo: (info: BaseGroupInfo) => void
   baseGroupInfo: BaseGroupInfo
   handleSkipNext: () => void
}

const CreateBaseGroup = ({
   handleNext,
   setBaseGroupInfo,
   baseGroupInfo,
   handleSkipNext,
}: CreateGroupProps) => {
   const classes = useStyles()
   const [groupedUniversities, setGroupedUniversities] = useState<
      GroupedUniversity[]
   >([])

   useEffect(() => {
      ;(async function () {
         const allUniversitiesByCountries =
            await universityRepo.getAllUniversitiesByCountries()
         setGroupedUniversities(
            allUniversitiesByCountries
               .reduce<GroupedUniversity[]>((acc, universitiesByCountry) => {
                  const countryCode = universitiesByCountry.id
                  const countryName =
                     universityCountryMap[countryCode] || "other"
                  const universities = universitiesByCountry.universities
                  return [
                     ...acc,
                     ...universities.map((university) => ({
                        ...university,
                        countryName,
                     })),
                  ]
               }, [])
               .sort(dynamicSort("countryName"))
         )
      })()
   }, [])

   const initialValues = useMemo(
      () => ({
         logoUrl: baseGroupInfo.logoUrl || "",
         logoFileObj: baseGroupInfo.logoFileObj || null,
         universityName: baseGroupInfo.universityName || "",
         description: baseGroupInfo.description || "",
         university: baseGroupInfo.university || null,
         isUniversity: baseGroupInfo.isUniversity || false,
         companySize: baseGroupInfo.companySize || "",
         companyIndustries: baseGroupInfo.companyIndustries || [],
         companyCountry: baseGroupInfo.companyCountry || null,
         isATSEnabled: baseGroupInfo.isATSEnabled || false,
      }),
      [
         baseGroupInfo.companyCountry,
         baseGroupInfo.companyIndustries,
         baseGroupInfo.companySize,
         baseGroupInfo.description,
         baseGroupInfo.isATSEnabled,
         baseGroupInfo.isUniversity,
         baseGroupInfo.logoFileObj,
         baseGroupInfo.logoUrl,
         baseGroupInfo.university,
         baseGroupInfo.universityName,
      ]
   )

   const handleSubmit = useCallback(
      (values, { setSubmitting }) => {
         let careerCenter: BaseGroupInfo = {
            logoUrl: values.logoUrl,
            logoFileObj: values.logoFileObj || baseGroupInfo.logoFileObj,
            description: values.description,
            test: false,
            universityName: values.universityName,
            isUniversity: values.isUniversity,
            university: values.university,
            companySize: values.companySize,
            companyIndustries: values.companyIndustries,
            companyCountry: values.companyCountry,
            isATSEnabled: values.isATSEnabled,
         }
         setBaseGroupInfo(careerCenter)
         setSubmitting(false)
         scrollTop()
         if (values.isUniversity) {
            handleNext()
         } else {
            handleSkipNext() // skip the field and level of study questions step
         }
      },
      [baseGroupInfo?.logoFileObj, handleNext, handleSkipNext, setBaseGroupInfo]
   )

   return (
      <Container maxWidth={"sm"} className={classes.root}>
         <Typography align="center" className={classes.title} variant="h1">
            Create a Career Group
         </Typography>
         <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
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
               /* and other goodies */
            }) => (
               <UiForm className={classes.form} onSubmit={handleSubmit}>
                  <Stack spacing={2} minWidth={"90%"}>
                     <FormControl
                        className={classes.form}
                        error={Boolean(
                           touched.logoFileObj &&
                              errors.logoFileObj &&
                              errors.logoFileObj
                        )}
                     >
                        <Box>
                           <img
                              className={classes.image}
                              alt="logo"
                              src={
                                 values.logoUrl.length
                                    ? values.logoUrl
                                    : placeholder
                              }
                           />
                        </Box>
                        <FilePickerContainer
                           extensions={["jpg", "jpeg", "png"]}
                           maxSize={20}
                           onBlur={handleBlur}
                           onChange={(fileObject) => {
                              setFieldValue(
                                 "logoUrl",
                                 URL.createObjectURL(fileObject),
                                 true
                              )
                              setFieldValue("logoFileObj", fileObject, true)
                           }}
                           onError={(errMsg) =>
                              setFieldError("logoFileObj", errMsg)
                           }
                        >
                           <Button
                              variant="contained"
                              size="large"
                              endIcon={<PublishIcon />}
                           >
                              {values.logoFileObj || baseGroupInfo.logoFileObj
                                 ? "Change"
                                 : "Upload Your Logo"}
                           </Button>
                        </FilePickerContainer>
                        <FormHelperText>
                           {touched.logoFileObj && errors.logoFileObj
                              ? errors.logoFileObj
                              : null}
                        </FormHelperText>
                     </FormControl>
                     <TextField
                        id="groupName"
                        value={values.universityName}
                        onChange={handleChange}
                        inputProps={{ maxLength: 60 }}
                        error={Boolean(
                           touched.universityName && errors.universityName
                        )}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                        helperText={
                           touched.universityName ? errors.universityName : null
                        }
                        label="Group Name"
                        name="universityName"
                        fullWidth
                     />
                     <TextField
                        label="Description"
                        onChange={handleChange}
                        error={Boolean(
                           touched.description && errors.description
                        )}
                        value={values.description}
                        inputProps={{ maxLength: 60 }}
                        placeholder="Please describe the purpose of your group"
                        onBlur={handleBlur}
                        helperText={
                           touched.description ? errors.description : null
                        }
                        disabled={isSubmitting}
                        name="description"
                        fullWidth
                     />
                     <CompanyMetadata
                        handleChange={handleChange}
                        values={values}
                        errors={errors}
                        handleBlur={handleBlur}
                        touched={touched}
                        isSubmitting={isSubmitting}
                     />

                     <FormControlLabel
                        control={
                           <Checkbox
                              value={values.isATSEnabled}
                              checked={values.isATSEnabled}
                              onChange={(event) => {
                                 setFieldValue(
                                    "isATSEnabled",
                                    event.target.checked
                                 )
                              }}
                           />
                        }
                        label="ATS integration enabled"
                     />

                     <FormControlLabel
                        style={{ marginTop: 0 }}
                        control={
                           <Checkbox
                              value={values.isUniversity}
                              checked={values.isUniversity}
                              onChange={(event) => {
                                 const checked = event.target.checked
                                 if (!checked) {
                                    setFieldValue("university", null, true)
                                 }
                                 setFieldValue("isUniversity", checked)
                              }}
                           />
                        }
                        label="This is a university"
                     />

                     <Collapse in={values.isUniversity}>
                        <VirtualizedAutocomplete
                           options={groupedUniversities}
                           onBlur={handleBlur}
                           value={values.university}
                           disabled={isSubmitting}
                           onChange={(event, value) => {
                              setFieldValue("university", value, true)
                           }}
                           groupBy={(option) => option.countryName}
                           isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                           }
                           getOptionLabel={(option) => option.name}
                           renderOption={(props, option) => [
                              props,
                              option.name,
                           ]}
                           fullWidth
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 name={"university"}
                                 label={"Choose a University"}
                                 error={Boolean(
                                    touched.university && errors.university
                                 )}
                                 helperText={
                                    touched.university
                                       ? errors.university
                                       : null
                                 }
                              />
                           )}
                        />
                     </Collapse>

                     <Button
                        size="large"
                        variant="contained"
                        fullWidth
                        disabled={isSubmitting}
                        color="primary"
                        type="submit"
                     >
                        Continue
                     </Button>
                  </Stack>
               </UiForm>
            )}
         </Formik>
      </Container>
   )
}

export default CreateBaseGroup
