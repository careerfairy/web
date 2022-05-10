import React from "react"
import {
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField,
} from "@mui/material"
import { Formik } from "formik"
import * as yup from "yup"
import { useInterests } from "../../custom-hook/useCollection"
import InterestSelect from "./InterestSelect"
import wishlistRepo from "../../../data/firebase/WishRepository"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import Stack from "@mui/material/Stack"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import { StylesProps } from "../../../types/commonTypes"
import UserAvatar from "../common/UserAvatar"
import Typography from "@mui/material/Typography"
import { useAuth } from "../../../HOCs/AuthProvider"
import Box from "@mui/material/Box"

interface CreateWishDialogProps {
   open: boolean
   onClose: () => void
}

const maxInterests = 5

const schema = yup.object().shape({
   description: yup
      .string()
      .required("The description is required")
      .max(255, "The description is too long")
      .min(10, "The description is too short"),
   isPublic: yup.boolean(),
   interests: yup
      .array()
      .of(
         yup.object().shape({
            id: yup.string().required("An interest is required"),
            name: yup.string().required("An interest is required"),
         })
      )
      .required("A valid interest must be selected")
      .max(maxInterests, "You can only add up to 5 interests"),
   // companyNames: yup
   //    .array()
   //    .of(yup.string().required("The company name is required"))
   //    .max(5, "You can only add 5 companies")
   //    .when("category", {
   //       is: "company",
   //       then: yup.array().min(1, "You must add at least one company"),
   //    }),
})

export interface CreateWishFormValues {
   description: Wish["description"]
   interests: Interest[]
   companyNames: Wish["companyNames"]
}

const styles: StylesProps = {
   title: {
      textAlign: "center",
      fontWeight: 600,
   },
   content: {
      borderBottom: "none",
      display: "flex",
   },
   fields: {
      pl: 2,
      flex: 1,
   },
   label: {
      fontWeight: 600,
   },
   actions: {
      p: 2,
   },
}

interface LabelProps {
   title: string
   // Specifies the id of the form element the label should be bound to
   htmlFor: string
}

const Label = ({ title, htmlFor }: LabelProps) => {
   return (
      <Typography
         component={"label"}
         variant="h6"
         htmlFor={htmlFor}
         sx={styles.label}
      >
         {title}
      </Typography>
   )
}
const CreateWishDialog = ({ open, onClose }: CreateWishDialogProps) => {
   // Material dialog
   const { userData } = useAuth()
   const initialValues: CreateWishFormValues = {
      description: "",
      interests: [],
      companyNames: [],
   }
   const { data: allInterests } = useInterests()

   const handleClose = () => {
      onClose()
   }

   const onSubmit = async (values: CreateWishFormValues) => {
      try {
         // create wish
         await wishlistRepo.createWish(values)
      } catch (e) {
         console.error("error in creating wish", e)
      }
      // close dialog
      handleClose()
   }

   return (
      <Dialog maxWidth={"sm"} fullWidth onClose={handleClose} open={open}>
         <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={onSubmit}
         >
            {({
               isSubmitting,
               values,
               touched,
               handleBlur,
               setFieldValue,
               handleChange,
               errors,
               handleSubmit,
            }) => (
               <form id={"creat-wish-form"}>
                  <DialogTitle sx={styles.title}>Create Wish</DialogTitle>
                  <DialogContent sx={styles.content} dividers>
                     <UserAvatar size={"large"} />
                     <Stack sx={styles.fields} spacing={2}>
                        <Box>
                           <Label
                              title={`${userData.firstName || ""} ${
                                 userData.lastName || ""
                              }`}
                              htmlFor={"description"}
                           />
                           <TextField
                              autoFocus
                              margin="dense"
                              id="description"
                              name="description"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.description}
                              helperText={
                                 errors.description &&
                                 touched.description &&
                                 errors.description
                              }
                              maxRows={6}
                              minRows={4}
                              error={Boolean(
                                 errors.description && touched.description
                              )}
                              disabled={isSubmitting}
                              label="Description"
                              type="text"
                              multiline
                              fullWidth
                           />
                        </Box>
                        <Box>
                           <Label
                              title={`Select tags (${
                                 maxInterests - values.interests.length
                              } left)`}
                              htmlFor={"interests"}
                           />
                           <InterestSelect
                              id={"interests"}
                              setFieldValue={setFieldValue}
                              disabled={isSubmitting}
                              touched={Boolean(touched.interests)}
                              error={errors.interests as string}
                              handleBlur={handleBlur}
                              selectedInterests={values.interests}
                              totalInterests={allInterests}
                           />
                        </Box>
                        {/*<Collapse in={values.category === "company"}>*/}
                        {/*   <CompanyNamesSelect*/}
                        {/*      setFieldValue={setFieldValue}*/}
                        {/*      disabled={isSubmitting}*/}
                        {/*      touched={touched.companyNames}*/}
                        {/*      error={errors.companyNames as string}*/}
                        {/*      handleBlur={handleBlur}*/}
                        {/*      selectedCompanyNames={values.companyNames}*/}
                        {/*   />*/}
                        {/*</Collapse>*/}
                     </Stack>
                  </DialogContent>
                  <DialogActions sx={styles.actions}>
                     <Button
                        size={"large"}
                        color={"grey"}
                        onClick={handleClose}
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        color={"secondary"}
                        size={"large"}
                        startIcon={
                           isSubmitting ? (
                              <CircularProgress size={20} color={"inherit"} />
                           ) : (
                              <AutoFixHighIcon />
                           )
                        }
                        variant={"contained"}
                     >
                        {isSubmitting ? "Making wish" : "Make your wish"}
                     </Button>
                  </DialogActions>
               </form>
            )}
         </Formik>
      </Dialog>
   )
}

export default CreateWishDialog
