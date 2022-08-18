import React, { useMemo, useState } from "react"
import Paper from "@mui/material/Paper"
import { Button, Grid, TextField, Typography } from "@mui/material"
import { Formik } from "formik"
import * as yup from "yup"
import UniversityCountriesSelector from "./UniversityCountriesSelector"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import FieldsOfStudyQuerySelector from "./FieldsOfStudyQuerySelector"
import LevelsOfStudyQuerySelector from "./LevelsOfStudyQuerySelector"

export interface IFormValues {
   label: string // unique
   // universityIds: string[]
   // OR
   universityCountryIds: string[]

   targetFieldsOfStudy: FieldOfStudy[]
   targetLevelsOfStudy: FieldOfStudy[]
}

const schema: yup.SchemaOf<IFormValues> = yup.object().shape({})

const QueryForm = () => {
   const firebase = useFirebaseService()
   const [fetching, setFetching] = useState(false)
   const initValues = useMemo<IFormValues>(
      () => ({
         targetFieldsOfStudy: [],
         targetLevelsOfStudy: [],
         universityCountryIds: [],
         // universityIds: [],
         label: "",
      }),
      []
   )

   const handleRequest = async (values: IFormValues) => {
      try {
         setFetching(true)
         console.log("-> start fetch..")
         const users = await firebase.queryUsers(values)
         console.log("-> users", users)
      } catch (e) {
         console.error(e)
      }
      setFetching(false)
   }

   return (
      <Formik
         enableReinitialize
         initialValues={initValues}
         validationSchema={schema}
         onSubmit={handleRequest}
      >
         {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            isSubmitting,
            /* and other goodies */
         }) => {
            return (
               <form id="signUpForm" onSubmit={handleSubmit}>
                  <Typography>{JSON.stringify(values)}</Typography>
                  <Paper variant={"outlined"}>
                     <Grid container spacing={1}>
                        <Grid item xs={12}>
                           <TextField
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.label}
                              name="label"
                              label="Label"
                              fullWidth
                              variant="outlined"
                              helperText={touched.label ? errors.label : ""}
                              error={touched.label && Boolean(errors.label)}
                           />
                        </Grid>
                        <Grid item xs={12}>
                           <UniversityCountriesSelector
                              inputName={"universityCountryIds"}
                              setFieldValue={setFieldValue}
                              value={values.universityCountryIds}
                           />
                        </Grid>
                        <Grid item xs={12}>
                           <FieldsOfStudyQuerySelector
                              setFieldValue={setFieldValue}
                              selectedItems={values.targetFieldsOfStudy}
                           />
                        </Grid>
                        <Grid item xs={12}>
                           <LevelsOfStudyQuerySelector
                              setFieldValue={setFieldValue}
                              selectedItems={values.targetLevelsOfStudy}
                           />
                        </Grid>
                     </Grid>
                  </Paper>
                  <Button type={"submit"}>
                     {isSubmitting ? "Fetching..." : "Fetch users"}
                  </Button>
               </form>
            )
         }}
      </Formik>
   )
}

export default QueryForm
