import { useState } from "react"
import SpeakersCard from "./SpeakersCard"
import CreatorDialog from "./CreatorAddEditDialog"
import FormSectionHeader from "../../FormSectionHeader"
import SelectSpeakersDropDown from "./SelectSpeakerDropDown"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { LivestreamCreator } from "../questions/commons"

const LivestreamFormSpeakersStep = () => {
   const {
      values: { speakers },
      setFieldValue,
   } = useLivestreamFormValues()

   const [currentCreator, setCurrentCreator] = useState(null)

   const [
      isAddEditDialogOpen,
      handleAddEditOpenDialog,
      handleAddEditCloseDialog,
   ] = useDialogStateHandler()

   const handleSpeakerRemove = (speakerId: LivestreamCreator["id"]) => {
      const newSpeakersState = speakers.values.filter(
         (speaker) => speaker.id !== speakerId
      )
      setFieldValue("speakers.values", newSpeakersState, true)
   }

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
                  handleSpeakerRemove(speaker.id)
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
