import { dummyCreators } from "@careerfairy/shared-lib/groups/creators"
import { Box } from "@mui/material"
import SelectCreatorDropDown, {
   addNewCreatorId,
} from "components/views/common/creator/SelectCreatorDropDown"
import { Field, Form, Formik } from "formik"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import SparksDialog, { useSparksForm } from "../SparksDialog"

const styles = sxStyles({
   root: {
      m: "auto",
      width: "100%",
   },
})

export type SelectCreatorFormValues = {
   creatorId: string
}
const initialValues: SelectCreatorFormValues = {
   creatorId: "",
} as const

const SelectCreatorView = () => {
   const { stepper } = useSparksForm()

   return (
      <SparksDialog.Container sx={styles.root}>
         <SparksDialog.Title>
            Select a{" "}
            <Box component="span" color="secondary.main">
               creator
            </Box>
         </SparksDialog.Title>
         <SparksDialog.Subtitle>
            A creator is the “star” of your spark. A creator is the employee
            featured in a Spark.
         </SparksDialog.Subtitle>
         <Box mt={5} />
         <Formik
            initialValues={initialValues}
            validationSchema={SelectCreatorSchema}
            onSubmit={(values, { setSubmitting }) => {
               if (values.creatorId === addNewCreatorId) {
                  stepper.goToStep("create-creator")
               }
               setSubmitting(false)
            }}
            validateOnBlur={false}
            validateOnChange={true}
         >
            {({ submitForm, isSubmitting, touched, errors }) => (
               <Form>
                  <Field
                     component={SelectCreatorDropDown}
                     name="creatorId"
                     type="select"
                     label="Search, select or create a new creator"
                     error={
                        touched.creatorId ? Boolean(errors.creatorId) : null
                     }
                     helperText={touched.creatorId ? errors.creatorId : null}
                     creators={dummyCreators}
                     submitForm={submitForm}
                     disabled={isSubmitting}
                  />
               </Form>
            )}
         </Formik>
      </SparksDialog.Container>
   )
}

const SelectCreatorSchema = yup.object().shape({
   creatorId: yup.string().required("Required"),
})

export default SelectCreatorView
