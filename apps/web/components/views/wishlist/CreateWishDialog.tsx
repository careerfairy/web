import React from "react"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField,
} from "@mui/material"
import { Formik } from "formik"
import * as yup from "yup"
import { useInterests } from "../../custom-hook/useCollection"
import CompanyNamesSelect from "./CompanyNamesSelect"
import InterestSelect from "./InterestSelect"
import wishlistRepo from "../../../data/firebase/WishRepository"

interface CreateWishDialogProps {
   open: boolean
   onClose: () => void
}

const schema = yup.object().shape({
   title: yup
      .string()
      .required("The title is required")
      .max(50, "The title is too long")
      .min(5, "The title is too short"),
   isPublic: yup.boolean(),
   category: yup.string().required("A category is required"),
   interests: yup
      .array()
      .of(yup.string().required("A valid interest must be selected"))
      .max(5, "You can only add up to 5 interests"),
   companyNames: yup
      .array()
      .of(yup.string().required("The company name is required"))
      .max(5, "You can only add 5 companies")
      .when("category", {
         is: "company",
         then: yup.array().min(1, "You must add at least one company"),
      }),
})

interface FormValues {
   title: string
   category: string
   interests: string[]
   companyNames: string[]
}
const CreateWishDialog = ({ open, onClose }: CreateWishDialogProps) => {
   // Material dialog
   const initialValues: FormValues = {
      title: "",
      category: "",
      interests: [],
      companyNames: [],
   }
   const { data: allInterests } = useInterests()

   const handleClose = () => {
      onClose()
   }

   const onSubmit = async (values: FormValues) => {
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
      <Dialog maxWidth={"md"} fullWidth onClose={handleClose} open={open}>
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
            }) => {
               console.log("-> errors", errors)
               console.log("-> values", values)
               return (
                  <form>
                     <DialogTitle>Create Wish</DialogTitle>
                     <DialogContent>
                        <TextField
                           autoFocus
                           margin="dense"
                           name="title"
                           onChange={handleChange}
                           onBlur={handleBlur}
                           value={values.title}
                           helperText={
                              errors.title && touched.title && errors.title
                           }
                           error={Boolean(errors.title && touched.title)}
                           disabled={isSubmitting}
                           label="Title"
                           type="text"
                           multiline
                           fullWidth
                        />
                        <CompanyNamesSelect
                           setFieldValue={setFieldValue}
                           disabled={isSubmitting}
                           touched={touched.companyNames}
                           error={errors.companyNames as string}
                           handleBlur={handleBlur}
                           selectedCompanyNames={values.companyNames}
                        />
                        <InterestSelect
                           setFieldValue={setFieldValue}
                           disabled={isSubmitting}
                           touched={touched.companyNames}
                           error={errors.companyNames as string}
                           handleBlur={handleBlur}
                           selectedInterests={values.interests}
                           totalInterests={allInterests}
                        />
                     </DialogContent>
                     <DialogActions>
                        <Button color={"grey"} onClick={handleClose}>
                           Cancel
                        </Button>
                        <Button
                           onClick={handleSubmit}
                           disabled={isSubmitting}
                           color={"primary"}
                           variant={"contained"}
                        >
                           Create
                        </Button>
                     </DialogActions>
                  </form>
               )
            }}
         </Formik>
      </Dialog>
   )
}

export default CreateWishDialog
