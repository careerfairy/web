import { useState } from "react"
import SpeakersCard from "./SpeakersCard"
import CreatorDialog from "./CreatorAddEditDialog"
import FormSectionHeader from "../../FormSectionHeader"
import SelectSpeakersDropDown from "./SelectSpeakerDropDown"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"

const LivestreamFormSpeakersStep = () => {
   const {
      values: { speakers },
   } = useLivestreamFormValues()

   const [currentCreator, setCurrentCreator] = useState(null)

   const [
      isAddEditDialogOpen,
      handleAddEditOpenDialog,
      handleAddEditCloseDialog,
   ] = useDialogStateHandler()

   return (
      <>
         <FormSectionHeader
            title={"Speakers"}
            subtitle={"Details about the speakers of the live stream"}
         />
         <SelectSpeakersDropDown
            fieldId={"speakers.values"}
            label={"Speakers of this event"}
            placeholder={"Search, select and create your speakers"}
            values={speakers.values}
            options={speakers.options}
            handleCreateNew={() => {
               setCurrentCreator(null)
               handleAddEditOpenDialog()
            }}
         />
         {speakers.values.map((speaker, index) => (
            <SpeakersCard
               key={`speaker-card-${index}`}
               speaker={speaker}
               handleEdit={() => {
                  setCurrentCreator(speaker)
                  handleAddEditOpenDialog()
               }}
               handleRemove={() => {
                  alert(`Will remove ${JSON.stringify(speaker, null, 2)}`)
               }}
            />
         ))}
         <CreatorDialog
            creator={currentCreator}
            isDialogOpen={isAddEditDialogOpen}
            handleCloseDialog={handleAddEditCloseDialog}
         />
      </>
   )
}

export default LivestreamFormSpeakersStep
