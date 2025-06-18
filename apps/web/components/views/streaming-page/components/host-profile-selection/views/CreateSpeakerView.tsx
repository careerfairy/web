import { CreateCreatorSchemaType } from "@careerfairy/shared-lib/groups/schemas"
import { LoadingButton } from "@mui/lab"
import { Box, Button } from "@mui/material"
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

export const CreateSpeakerView = () => {
   return (
      <CreatorFormProvider
         /** Hides email field since only adhoc speakers (don't have an email) can be created in this view */
         hideEmailField
      >
         <View component="form">
            <View.Content>
               <View.Title>
                  New{" "}
                  <Box component="span" color="primary.main">
                     Speaker
                  </Box>
               </View.Title>
               <View.Subtitle>
                  You can now insert your details and join the live stream!
               </View.Subtitle>
            </View.Content>
            <Box sx={styles.formFields}>
               <CreatorFormFields />
            </Box>
            <Actions />
         </View>
      </CreatorFormProvider>
   )
}

const Actions = () => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()
   const { joinLiveStreamWithSpeaker, goBackToSelectSpeaker } =
      useHostProfileSelection()

   const { handleSubmit: handleSubmitSpeakerForm } = useSpeakerFormSubmit(
      livestreamId,
      streamerAuthToken
   )

   const {
      handleSubmit,
      formState: { isSubmitting, isValid, isDirty },
   } = useFormContext<CreateCreatorSchemaType>()

   const handleJoin = async (values: CreateCreatorSchemaType) => {
      const newSpeaker = await handleSubmitSpeakerForm(values)
      joinLiveStreamWithSpeaker(newSpeaker.id)
   }

   return (
      <View.Actions>
         <Button
            color="grey"
            variant="outlined"
            onClick={goBackToSelectSpeaker}
         >
            Back
         </Button>
         <LoadingButton
            loading={isSubmitting}
            disabled={!isValid || !isDirty}
            variant="contained"
            onClick={handleSubmit(handleJoin)}
         >
            Join live stream
         </LoadingButton>
      </View.Actions>
   )
}
