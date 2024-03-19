import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { Form, Formik } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import * as yup from "yup"
import GroupPlansDialog, { useSparksPlansForm } from "../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { isMobile } from "react-device-detect"
import GroupSparksPlanDesktopSelector from "./components/GroupSparksPlanDesktopSelector"

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

const SelectSparksPlanView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   const { goToSelectPlanView } = useSparksPlansForm()
   const { group } = useGroup()
   console.log("🚀 ~ View ~ group:", group, goToSelectPlanView)

   return (
      <GroupPlansDialog.Container>
         <GroupPlansDialog.Content sx={styles.content}>
            <GroupPlansDialog.Title>
               Select your{" "}
               <Box component="span" color="secondary.main">
                  Sparks
               </Box>{" "}
               plan
            </GroupPlansDialog.Title>
            <GroupPlansDialog.Subtitle>
               Tailored offers that best suit YOUR needs.
            </GroupPlansDialog.Subtitle>
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
                  //   if (values.creatorId === addNewCreatorId) {
                  //      goToCreateOrEditCreatorView(null)
                  //   } else {
                  //      const creator = creators.find(
                  //         (creator) => creator.id === values.creatorId
                  //      )
                  //      if (creator) {
                  //         goToCreatorSelectedView(
                  //            pickPublicDataFromCreator(creator)
                  //         )
                  //      }
                  //   }

                  setSubmitting(false)

                  resetForm()
               }}
               validateOnBlur={false}
               validateOnChange={true}
            >
               {({ isSubmitting }) => (
                  <Box
                     width="100%"
                     component={Form}
                     alignItems={"center"}
                     justifyContent={"center"}
                     alignContent={"center"}
                  >
                     {/* <SelectCreatorDropDown
                        name="creatorId"
                        label="Select a plan"
                        creators={creators}
                        disabled={isSubmitting}
                     /> */}
                     <ConditionalWrapper
                        condition={isMobile ? !isSubmitting : null}
                        fallback={<GroupSparksPlanDesktopSelector />}
                     >
                        {/* <GroupSparksPlanMobileSelector /> */}
                     </ConditionalWrapper>
                  </Box>
               )}
            </Formik>

            <Box
               mb={{
                  xs: "auto",
                  md: 20,
               }}
            />
         </GroupPlansDialog.Content>
         <GroupPlansDialog.Actions>
            {/* <GroupPlansDialog.Button
               color="grey"
               variant="outlined"
               onClick={() => {
                  // resetForm()
                  // if (isEditing) {
                  //    goToCreatorSelectedView(pickPublicDataFromCreator(creator))
                  // } else {
                  //    handleBack() // go back to select another creator view
                  // }
               }}
            >
               { "Back"}
            </GroupPlansDialog.Button> */}
         </GroupPlansDialog.Actions>
      </GroupPlansDialog.Container>
   )
}

const SelectCreatorSchema = yup.object().shape({
   creatorId: yup.string().required("Required"),
})

export default SelectSparksPlanView
