import {
   HygraphRemoteFieldOfStudyResponse,
   HygraphResponseHero,
} from "../../../types/cmsTypes"
import { sxStyles } from "../../../types/commonTypes"
import React, { useCallback } from "react"
import { Hero } from "../blocks"
import {
   MenuItem,
   TextField,
   Box,
   CircularProgress,
   Button,
} from "@mui/material"
import { Formik } from "formik"
import { useRouter } from "next/router"

type Props = {
   fieldsOfStudy: HygraphRemoteFieldOfStudyResponse[]
   hero: HygraphResponseHero
}

const styles = sxStyles({
   wrapper: {
      textAlign: {
         xs: "center",
         lg: "start",
      },
   },
   input: {
      backgroundColor: "white !important",
      boxShadow: 3,
   },
   selector: {
      width: {
         xs: "100%",
         md: "60%",
         lg: "80%",
      },
   },
   selectorItem: {
      color: "black",
   },
   button: {
      mt: 2,
      width: { xs: "100%", md: "auto" },
      minWidth: "150px",
   },
})

const initialValues = { selectedFieldOfStudyName: "" }

const LandingPage = ({ fieldsOfStudy, hero }: Props) => {
   const { push } = useRouter()

   const handleSubmit = useCallback(
      ({ selectedFieldOfStudyName }) => {
         const fieldOfStudy = fieldsOfStudy.find(
            ({ fieldOfStudyId }) =>
               fieldOfStudyId.toUpperCase() ===
               selectedFieldOfStudyName.toUpperCase()
         )

         void push(
            `/landing/${fieldOfStudy.marketingLandingPage?.slug}?fieldOfStudyId=${fieldOfStudy.fieldOfStudyId}`
         )
      },
      [fieldsOfStudy, push]
   )

   return (
      <Hero {...hero}>
         {fieldsOfStudy.length > 0 && (
            <Box sx={styles.wrapper}>
               <Formik
                  initialValues={initialValues}
                  enableReinitialize
                  onSubmit={handleSubmit}
               >
                  {({
                     values,
                     handleChange,
                     handleBlur,
                     handleSubmit,
                     isSubmitting,
                  }) => (
                     <form onSubmit={handleSubmit}>
                        <TextField
                           select
                           inputProps={{
                              sx: styles.input,
                           }}
                           id="selectedFieldOfStudyName"
                           name="selectedFieldOfStudyName"
                           label={hero?.selectorLabel}
                           fullWidth
                           variant="filled"
                           sx={styles.selector}
                           value={values.selectedFieldOfStudyName}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           disabled={isSubmitting}
                        >
                           {fieldsOfStudy.map((entry) => (
                              <MenuItem
                                 key={entry.fieldOfStudyId}
                                 value={entry.fieldOfStudyId}
                              >
                                 {entry.fieldOfStudyName}
                              </MenuItem>
                           ))}
                        </TextField>

                        <Box>
                           <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              disabled={
                                 values.selectedFieldOfStudyName.length === 0 ||
                                 isSubmitting
                              }
                              endIcon={
                                 isSubmitting && (
                                    <CircularProgress
                                       size={20}
                                       color="inherit"
                                    />
                                 )
                              }
                              sx={styles.button}
                           >
                              {hero.selectorLabel || "Send"}
                           </Button>
                        </Box>
                     </form>
                  )}
               </Formik>
            </Box>
         )}
      </Hero>
   )
}

export default LandingPage
