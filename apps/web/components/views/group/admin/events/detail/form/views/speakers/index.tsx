import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Box, useTheme } from "@mui/material"
import { useHostsCreatorsSWR } from "components/custom-hook/creator/useHostsCreatorsSWR"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useAuth } from "HOCs/AuthProvider"
import { useState } from "react"
import { User } from "react-feather"
import { useLivestreamCreationContext } from "../../../LivestreamCreationContext"
import { hashToColor } from "../../commons"
import EmptyFormSection from "../../EmptyFormSection"
import FormSectionHeader from "../../FormSectionHeader"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import InputSkeleton from "../questions/InputSkeleton"
import CreatorDialog from "./CreatorAddEditDialog"
import SelectSpeakersDropDown from "./SelectSpeakersDropDown"
import SpeakersCard from "./SpeakersCard"

const LivestreamFormSpeakersStep = () => {
   const theme = useTheme()
   const { userData, adminGroups } = useAuth()
   const {
      values: { speakers, questions },
      setFieldValue,
   } = useLivestreamFormValues()

   // Get the livestream data from the form context
   const { livestream } = useLivestreamCreationContext()

   // Use questions.hosts if available, otherwise fallback to livestream.groupIds
   const hasFormHosts = questions.hosts.length > 0
   const formHostIds = questions.hosts.map((group) => group.id)
   const fallbackGroupIds = livestream?.groupIds || []

   const {
      data: hostCreators,
      isLoading,
      isValidating,
   } = useHostsCreatorsSWR(hasFormHosts ? formHostIds : fallbackGroupIds)

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

   const handleSpeakerEdit = (speaker: Creator) => {
      setCurrentCreator(speaker)
      handleAddEditOpenDialog()
   }

   const canEditSpeaker = (speaker: Creator) => {
      // CF admins can always edit any speaker
      if (userData?.isAdmin) {
         return true
      }

      // Check if user is an admin of the speaker's group
      if (speaker.groupId && adminGroups) {
         return speaker.groupId in adminGroups
      }

      return false
   }

   if (isLoading || isValidating) {
      return <InputSkeleton />
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
               options={hostCreators || []}
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
                     handleEdit={
                        canEditSpeaker(speaker)
                           ? () => handleSpeakerEdit(speaker)
                           : undefined
                     }
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
