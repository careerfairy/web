import { mapSpeakerToCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Button } from "@mui/material"
import {
   CreatorFormFields,
   CreatorFormProvider,
} from "components/views/creator/CreatorForm"
import { CreateCreatorSchemaType } from "components/views/sparks/forms/schemas/CreateCreatorSchema"
import { groupRepo } from "data/RepositoryInstances"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"
import { View } from "../View"

const styles = sxStyles({
   root: {},
   formFields: {
      px: {
         xs: 2,
         tablet: 4,
      },
   },
})

export const EditSpeakerView = () => {
   const { goBackToSelectSpeaker, selectedSpeaker } = useHostProfileSelection()

   return (
      <CreatorFormProvider
         creator={
            selectedSpeaker ? mapSpeakerToCreator(selectedSpeaker) : undefined
         }
      >
         {() => (
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
         )}
      </CreatorFormProvider>
   )
}

const SaveChangesButton = () => {
   const { goBackToSelectSpeaker } = useHostProfileSelection()
   const { handleSubmit } = useFormContext<CreateCreatorSchemaType>()

   const onSubmit = async (values: CreateCreatorSchemaType) => {
      /**
       * TODO:
       * 1. Update Creator if exists
       * 2. Update related Speaker on live stream
       */

      const existingCreator = await groupRepo.getCreatorById(values.id)

      if (existingCreator) {
         await groupRepo.updateCreatorInGroup(
            existingCreator.groupId,
            existingCreator.id,
            values
         )
      }

      console.log(
         "🚀 ~ file: EditSpeakerView.tsx:27 ~ onSubmit ~ values:",
         values
      )
   }

   return (
      <Button
         disabled
         onClick={() => {
            handleSubmit((values) => onSubmit(values))().then(
               goBackToSelectSpeaker
            )
         }}
      >
         Save changes
      </Button>
   )
}
