import { Group } from "@careerfairy/shared-lib/groups"
import { Chip, Stack } from "@mui/material"
import { useGroups } from "components/custom-hook/useCollection"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useEffect, useState } from "react"
import { useLivestreamCreationContext } from "../../../LivestreamCreationContext"
import { hashToColor } from "../../commons"
import MultiChipSelect from "../general/components/MultiChipSelect"
import GroupedRegistrationQuestions from "./GroupedRegistrationQuestions"
import InputSkeleton from "./InputSkeleton"
import LoadErrorMessage from "./LoadErrorMessage"

const RegistrationQuestionsListForCFAdmin = () => {
   const { group: currentGroup } = useGroup()
   const { data: allGroups, isLoading: groupsLoading, error } = useGroups()
   const { livestream } = useLivestreamCreationContext()
   const [selectedGroups, setSelectedGroups] = useState<Group[]>([])

   useEffect(() => {
      if (!groupsLoading) {
         const initialValue = allGroups.filter((group) =>
            livestream.groupIds.includes(group.id)
         )
         setSelectedGroups(initialValue)
      }
   }, [groupsLoading, allGroups, livestream.groupIds])

   if (error) {
      return <LoadErrorMessage label="groups" />
   }

   if (groupsLoading) {
      return (
         <Stack spacing={2}>
            <InputSkeleton />
            <InputSkeleton />
         </Stack>
      )
   }

   return (
      <>
         <MultiChipSelect
            id="registration-questions-list"
            options={allGroups}
            value={selectedGroups}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Live Stream Hosts",
               placeholder: "Add some hosts to your live stream",
            }}
            getOptionLabel={(group: Group) => group.universityName}
            onChange={(_, value) => {
               setSelectedGroups(value)
            }}
            getOptionDisabled={(group) => group.id === currentGroup.groupId}
            renderTags={(value: Group[], getTagProps) => {
               return value.map((option, index) => {
                  const isDisabled: boolean =
                     option.groupId === currentGroup.groupId
                  return (
                     <Chip
                        key={option.groupId}
                        {...getTagProps({ index })}
                        disabled={isDisabled}
                        label={option.universityName}
                        sx={[
                           {
                              backgroundColor: `${hashToColor(
                                 option.groupId
                              )} !important`,
                           },
                           Boolean(isDisabled) && {
                              opacity: "0.5 !important",
                           },
                        ]}
                     />
                  )
               })
            }}
         />
         <GroupedRegistrationQuestions
            selectedGroups={selectedGroups}
            allGroups={allGroups}
         />
      </>
   )
}

export default RegistrationQuestionsListForCFAdmin
