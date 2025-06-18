import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Box, useTheme } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useState } from "react"
import { User } from "react-feather"
import EmptyFormSection from "../../EmptyFormSection"
import FormSectionHeader from "../../FormSectionHeader"
import { hashToColor } from "../../commons"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import CreatorDialog from "./CreatorAddEditDialog"
import SelectSpeakersDropDown from "./SelectSpeakersDropDown"
import SpeakersCard from "./SpeakersCard"

const LivestreamFormSpeakersStep = () => {
   const theme = useTheme()
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

   const handleSpeakerRemove = (speakerId: Creator["id"]) => {
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
         <Box id="speakers.values">
            <SelectSpeakersDropDown
               id={"speakers.values"}
               label={"Speakers of this event"}
               placeholder={"Search, select and create your speakers"}
               values={speakers.values}
               options={speakers.options}
               handleCreateNew={() => {
                  setCurrentCreator(null)
                  handleAddEditOpenDialog()
               }}
            />
         </Box>
         {speakers.values.length > 0 ? (
            <>
               {speakers.values.map((speaker) => (
                  <SpeakersCard
                     key={`${speaker.id}-${hashToColor(
                        JSON.stringify(speaker)
                     )}`}
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
            </>
         ) : (
            <EmptyFormSection
               icon={<User size={70} color={theme.palette.secondary.main} />}
               title={"Select a speaker!"}
               caption={
                  "Selecting at least one speaker is required in order to publish your live stream."
               }
            />
         )}
         <CreatorDialog
            creator={currentCreator}
            isDialogOpen={isAddEditDialogOpen}
            handleCloseDialog={handleAddEditCloseDialog}
         />
      </>
   )
}

export default LivestreamFormSpeakersStep
