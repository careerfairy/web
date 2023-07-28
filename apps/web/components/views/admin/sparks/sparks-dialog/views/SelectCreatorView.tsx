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
import { sxStyles } from "types/commonTypes"
import { pickPublicDataFromCreator } from "@careerfairy/shared-lib/groups/creators"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
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
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   const { goToCreateOrEditCreatorView, goToCreatorSelectedView } =
      useSparksForm()
   const { group } = useGroup()
   const { data: creators } = useGroupCreators(group.id)

   return (
      <SparksDialog.Container>
         <SparksDialog.Content sx={styles.content}>
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
            <Box
               mt={{
                  md: 0,
               }}
            />
            <Formik
               initialValues={initialValues}
               validationSchema={SelectCreatorSchema}
               onSubmit={(values, { setSubmitting, resetForm }) => {
                  if (values.creatorId === addNewCreatorId) {
                     goToCreateOrEditCreatorView(null)
                  } else {
                     const creator = creators.find(
                        (creator) => creator.id === values.creatorId
                     )
                     if (creator) {
                        goToCreatorSelectedView(
                           pickPublicDataFromCreator(creator)
                        )
                     }
                  }

                  setSubmitting(false)

                  resetForm()
               }}
               validateOnBlur={false}
               validateOnChange={true}
            >
               {({ isSubmitting }) => (
                  <Box width="100%" component={Form}>
                     <SelectCreatorDropDown
                        name="creatorId"
                        label="Search, select or create a new creator"
                        creators={creators}
                        disabled={isSubmitting}
                     />
                  </Box>
               )}
            </Formik>
            <Box
               mb={{
                  xs: "auto",
                  md: 0,
               }}
            />
         </SparksDialog.Content>
      </SparksDialog.Container>
   )
}

const SelectCreatorSchema = yup.object().shape({
   creatorId: yup.string().required("Required"),
})

export default SelectCreatorView
