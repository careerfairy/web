import { FormControl, Grid, Typography } from "@mui/material"
import { Formik } from "formik"
import React, { useMemo } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import MultiListSelect from "../../common/MultiListSelect"
import { languageCodes } from "../../../helperFunctions/streamFormFunctions"

const styles = sxStyles({
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

type Option = {
   code: string
   name: string
   shortName: string
}

const countriesCodes = [
   {
      code: "en",
      name: "England",
      shortName: "eng",
   },
   {
      code: "de",
      name: "Germany",
      shortName: "ger",
   },
   {
      code: "pt",
      name: "Portugal",
      shortName: "por",
   },
]

const AdditionalInformation = () => {
   const initValues = useMemo(
      () => ({
         languages: [] as Option[],
         countries: [] as Option[],
      }),
      []
   )

   return (
      <Formik
         enableReinitialize={true}
         initialValues={initValues}
         onSubmit={(values) => {
            console.log("values ->", values)
         }}
      >
         {({
            values,
            handleChange,
            handleSubmit,
            setFieldValue,
            /* and other goodies */
         }) => (
            <form id="additionalInformationForm" onSubmit={handleSubmit}>
               <Grid container>
                  <Grid item xs={12}>
                     <Typography sx={styles.subtitle} variant="h5">
                        Languages
                     </Typography>
                  </Grid>
                  <Grid item xs={12}>
                     <FormControl fullWidth>
                        <Grid item xs={12}>
                           <MultiListSelect
                              inputName="languages"
                              selectedItems={values.languages}
                              allValues={languageCodes}
                              setFieldValue={setFieldValue}
                              inputProps={{
                                 label: "Languages you speak",
                                 placeholder: "Select language",
                              }}
                              getValueFn={(item) => item}
                              getLabelFn={(item) => item.name}
                           />
                        </Grid>
                     </FormControl>

                     <Grid item xs={12}>
                        <Typography sx={styles.subtitle} variant="h5">
                           Countries
                        </Typography>
                     </Grid>
                     <FormControl fullWidth>
                        <Grid item xs={12}>
                           <MultiListSelect
                              inputName="countries"
                              selectedItems={values.countries}
                              allValues={countriesCodes}
                              setFieldValue={setFieldValue}
                              inputProps={{
                                 label: "Countries of interest",
                                 placeholder: "Select country",
                              }}
                              getValueFn={(item) => item}
                              getLabelFn={(item) => item.name}
                           />
                        </Grid>
                     </FormControl>
                  </Grid>
               </Grid>
            </form>
         )}
      </Formik>
   )
}

export default AdditionalInformation
