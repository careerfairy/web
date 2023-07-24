import { Box } from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import useIsMobile from "components/custom-hook/useIsMobile"
import CreateOrEditCreatorForm from "components/views/sparks/forms/CreateOrEditCreatorForm"
import { useFormikContext } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback } from "react"
import { useSelector } from "react-redux"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import { SparkFormValues } from "./hooks/useSparkFormSubmit"

const CreateOrEditCreatorView = () => {
   const { goToSelectCreatorView, goToCreatorSelectedView } = useSparksForm()
   const { group } = useGroup()
   const isMobile = useIsMobile()

   const selectedCreatorId = useSelector(sparksSelectedCreatorId)

   const handleBack = useCallback(() => {
      goToSelectCreatorView()
   }, [goToSelectCreatorView])

   return (
      <CreatorFetchWrapper
         selectedCreatorId={selectedCreatorId}
         groupId={group.id}
         shouldFetch={Boolean(selectedCreatorId)}
      >
         {(creator) => (
            <SparksDialog.Container onMobileBack={() => handleBack()}>
               {creator ? (
                  <SparksDialog.Title>
                     <Box component="span" color="secondary.main">
                        Editing
                     </Box>{" "}
                     creator
                  </SparksDialog.Title>
               ) : (
                  <SparksDialog.Title>
                     Create {isMobile ? "" : "a"} new{" "}
                     <Box component="span" color="secondary.main">
                        profile
                     </Box>
                  </SparksDialog.Title>
               )}
               <SparksDialog.Subtitle>
                  {creator
                     ? "Please check if that’s the correct creator"
                     : "Insert your new creator details!"}
               </SparksDialog.Subtitle>
               <Box mt={4} />
               <CreateOrEditCreatorForm
                  groupId={group.id}
                  actions={<Actions handleBack={handleBack} />}
                  creator={creator}
                  onSuccessfulSubmit={goToCreatorSelectedView}
               />
            </SparksDialog.Container>
         )}
      </CreatorFetchWrapper>
   )
}

type ActionsProps = {
   handleBack: () => void
}

const Actions: FC<ActionsProps> = ({ handleBack }) => {
   const { submitForm, isSubmitting, dirty, isValid, resetForm, values } =
      useFormikContext<SparkFormValues>()

   return (
      <>
         <SparksDialog.ActionsOffset />
         <SparksDialog.Actions>
            <SparksDialog.Button
               color="grey"
               variant="outlined"
               onClick={() => {
                  resetForm()
                  handleBack()
               }}
            >
               Back
            </SparksDialog.Button>
            <SparksDialog.Button
               variant="contained"
               onClick={submitForm}
               disabled={isSubmitting || !dirty || !isValid}
               loading={isSubmitting}
            >
               {values.id ? "Save changes" : "Create"}
            </SparksDialog.Button>
         </SparksDialog.Actions>
      </>
   )
}

export default CreateOrEditCreatorView
