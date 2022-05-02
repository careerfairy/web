import React from "react"
import {
   Button,
   Collapse,
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
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import { Wish, WishCategories } from "@careerfairy/shared-lib/dist/wishes"
import CategorySelect from "./CategorySelect"
import Stack from "@mui/material/Stack"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
interface CreateWishDialogProps {
   open: boolean
   onClose: () => void
}

const schema = yup.object().shape({
   title: yup
      .string()
      .required("The title is required")
      .max(255, "The title is too long")
      .min(10, "The title is too short"),
   isPublic: yup.boolean(),
   category: yup.string().required("A category is required"),
   interests: yup
      .array()
      .of(
         yup.object().shape({
            id: yup.string().required("An interest is required"),
            name: yup.string().required("An interest is required"),
         })
      )
      .required("A valid interest must be selected")
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

export interface CreateWishFormValues {
   title: Wish["title"]
   category: Wish["category"]
   interests: Interest[]
   companyNames: Wish["companyNames"]
}
const CreateWishDialog = ({ open, onClose }: CreateWishDialogProps) => {
   // Material dialog
   const initialValues: CreateWishFormValues = {
      title: "",
      category: WishCategories.OTHER,
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
      <Dialog
         maxWidth={"md"}
         PaperProps={{ sx: { borderRadius: 2 } }}
         fullWidth
         onClose={handleClose}
         open={open}
      >
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
               <form>
                  <DialogTitle>Create Wish</DialogTitle>
                  <DialogContent>
                     <Stack spacing={2}>
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
                        <InterestSelect
                           setFieldValue={setFieldValue}
                           disabled={isSubmitting}
                           touched={Boolean(touched.interests)}
                           error={errors.interests as string}
                           handleBlur={handleBlur}
                           selectedInterests={values.interests}
                           totalInterests={allInterests}
                        />
                        <CategorySelect
                           handleChange={handleChange}
                           selectedCategory={values.category}
                           setFieldValue={setFieldValue}
                        />
                        <Collapse in={values.category === "company"}>
                           <CompanyNamesSelect
                              setFieldValue={setFieldValue}
                              disabled={isSubmitting}
                              touched={touched.companyNames}
                              error={errors.companyNames as string}
                              handleBlur={handleBlur}
                              selectedCompanyNames={values.companyNames}
                           />
                        </Collapse>
                     </Stack>
                  </DialogContent>
                  <DialogActions>
                     <Button color={"grey"} onClick={handleClose}>
                        Cancel
                     </Button>
                     <Button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        color={"primary"}
                        startIcon={<AutoFixHighIcon />}
                        variant={"contained"}
                     >
                        Make your wish
                     </Button>
                  </DialogActions>
               </form>
            )}
         </Formik>
      </Dialog>
   )
}

export default CreateWishDialog
