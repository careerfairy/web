import {
   mapCreatorToSpeaker,
   mapSpeakerToCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { CreateCreatorSchemaType } from "@careerfairy/shared-lib/groups/schemas"
import { LoadingButton } from "@mui/lab"
import { Box, Button, CircularProgress } from "@mui/material"
import { useCreator } from "components/custom-hook/creator/useCreator"
import { useSpeakerFormSubmit } from "components/custom-hook/live-stream/useSpeakerFormSubmit"
import {
   CreatorFormFields,
   CreatorFormProvider,
} from "components/views/creator/CreatorForm"
import { useStreamingContext } from "components/views/streaming-page/context"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"
import { View } from "../View"

const styles = sxStyles({
   formFields: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      px: {
         xs: 2,
         tablet: 4,
      },
      pb: 1,
   },
})

export const EditSpeakerView = () => {
   const { goBackToSelectSpeaker, selectedSpeaker } = useHostProfileSelection()
   const { data: creator, isLoading } = useCreator(
      selectedSpeaker?.groupId,
      selectedSpeaker?.id
   )

   const isRelatedToCreator = !!creator

   // If we found a creator, use that data, otherwise use the speaker data
   const creatorData = isRelatedToCreator
      ? creator
      : selectedSpeaker
      ? mapSpeakerToCreator(selectedSpeaker)
      : undefined

   if (isLoading) {
      return <CircularProgress />
   }

   return (
      <CreatorFormProvider
         creator={creatorData}
         hideEmailField={!isRelatedToCreator}
      >
         <View component="form">
            <View.Content>
               <View.Title>
                  Edit{" "}
                  <Box component="span" color="primary.main">
                     Speaker
                  </Box>
               </View.Title>
               <View.Subtitle>
                  Check and change your speaker details
               </View.Subtitle>
            </View.Content>
            <Box sx={styles.formFields}>
               <CreatorFormFields />
            </Box>
            <View.Actions>
               <Button
                  color="grey"
                  variant="outlined"
                  onClick={goBackToSelectSpeaker}
               >
                  Back
               </Button>
               <SaveChangesButton />
            </View.Actions>
         </View>
      </CreatorFormProvider>
   )
}

const SaveChangesButton = () => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()
   const { selectSpeaker } = useHostProfileSelection()

   const { handleSubmit: handleSubmitSpeakerForm } = useSpeakerFormSubmit(
      livestreamId,
      streamerAuthToken
   )

   const {
      handleSubmit,
      formState: { isSubmitting, isValid, isDirty },
   } = useFormContext<CreateCreatorSchemaType>()

   const onSubmit = async (values: CreateCreatorSchemaType) => {
      await handleSubmitSpeakerForm(values)
      selectSpeaker(mapCreatorToSpeaker(values))
   }

   return (
      <LoadingButton
         loading={isSubmitting}
         disabled={!isValid || !isDirty}
         variant="contained"
         onClick={handleSubmit(onSubmit)}
      >
         Save changes
      </LoadingButton>
   )
}
