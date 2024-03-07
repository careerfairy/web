/* eslint-disable react-hooks/exhaustive-deps */
import { useGroup } from "layouts/GroupDashboardLayout"
import SelectSpeakersDropDown from "./SelectSpeakerDropDown"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import { useMemo, useState } from "react"
import FormSectionHeader from "../../FormSectionHeader"
import CreatorDialog from "./CreatorAddEditDialog"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import SpeakersCard from "./SpeakersCard"

const LivestreamFormSpeakersStep = () => {
   const {
      values: { speakers },
   } = useLivestreamFormValues()

   const { group } = useGroup()
   const { data: creators } = useGroupCreators(group.id)

   const mapCreatorsToSpeakersModel = creators.map((creator, index) => {
      const matchingSpeaker = speakers.speakers.find((speaker) => {
         const speakerFullName =
            `${speaker.firstName} ${speaker.lastName}`.replaceAll(" ", "")
         const creatorFullName =
            `${creator.firstName} ${creator.lastName}`.replaceAll(" ", "")
         return speakerFullName === creatorFullName
      })

      return {
         id: matchingSpeaker?.id || creator.id,
         avatar: creator.avatarUrl,
         background: creator.story,
         email: creator.email,
         firstName: creator.firstName,
         lastName: creator.lastName,
         position: creator.position,
         rank: index,
      }
   })

   const options = useMemo(
      () => [...speakers.speakers, ...mapCreatorsToSpeakersModel],
      []
   )

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
            fieldId={"speakers.speakers"}
            label={"Speakers of this event"}
            placeholder={"Search, select and create your speakers"}
            values={speakers.speakers}
            options={options}
            handleCreateNew={() => {
               setCurrentCreator(null)
               handleAddEditOpenDialog()
            }}
         />
         {speakers.speakers.map((speaker, index) => (
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
