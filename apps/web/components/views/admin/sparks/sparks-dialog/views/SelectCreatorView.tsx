import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import SelectCreatorDropDown, {
   addNewCreatorId,
} from "components/views/common/creator/SelectCreatorDropDown"
import { Form, Formik } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import * as yup from "yup"
import SparksDialog, { useSparksForm } from "../SparksDialog"

export type SelectCreatorFormValues = {
   creatorId: string
}
const initialValues: SelectCreatorFormValues = {
   creatorId: "",
} as const

const SelectCreatorView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   const { goToCreateOrEditCreatorView, handleClose, goToCreatorSelectedView } =
      useSparksForm()
   const { group } = useGroup()
   const { data: creators } = useGroupCreators(group.id)

   return (
      <SparksDialog.Container onMobileBack={handleClose}>
         <SparksDialog.Title pl={2}>
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
            onSubmit={(values, { setSubmitting, resetForm }) => {
               if (values.creatorId === addNewCreatorId) {
                  goToCreateOrEditCreatorView(null)
               } else {
                  goToCreatorSelectedView(values.creatorId)
               }

               setSubmitting(false)

               resetForm()
            }}
            validateOnBlur={false}
            validateOnChange={true}
         >
            {({ isSubmitting }) => (
               <Form>
                  <SelectCreatorDropDown
                     name="creatorId"
                     type="select"
                     label="Search, select or create a new creator"
                     creators={creators}
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
