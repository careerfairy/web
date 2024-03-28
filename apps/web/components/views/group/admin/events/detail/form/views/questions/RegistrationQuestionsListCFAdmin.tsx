import { Group } from "@careerfairy/shared-lib/groups"
import { Chip, Stack } from "@mui/material"
import { useGroups } from "components/custom-hook/useCollection"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useEffect } from "react"
import { useLivestreamCreationContext } from "../../../LivestreamCreationContext"
import { hashToColor } from "../../commons"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import MultiChipSelect from "../general/components/MultiChipSelect"
import GroupedRegistrationQuestions from "./GroupedRegistrationQuestions"
import InputSkeleton from "./InputSkeleton"
import LoadErrorMessage from "./LoadErrorMessage"

const RegistrationQuestionsListForCFAdmin = () => {
   const { group: currentGroup } = useGroup()
   const { data: allGroups, isLoading: groupsLoading, error } = useGroups()
   const { livestream } = useLivestreamCreationContext()
   const {
      values: { questions },
      setFieldValue,
   } = useLivestreamFormValues()

   useEffect(() => {
      if (!groupsLoading && !questions.hosts.length) {
         const initialValue = allGroups.filter((group) =>
            livestream.groupIds.includes(group.id)
         )
         setFieldValue("questions.hosts", initialValue)
      }
   }, [
      groupsLoading,
      allGroups,
      livestream.groupIds,
      setFieldValue,
      questions.hosts,
   ])

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
            id="questions.hosts"
            options={allGroups}
            value={questions.hosts}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Live Stream Hosts",
               placeholder: "Add some hosts to your live stream",
            }}
            getOptionLabel={(group: Group) => group.universityName}
            onChange={async (_, value) => {
               const registrationQuestionsFiltered =
                  questions.registrationQuestions.filter((question) =>
                     value.some((group) => group.id === question.groupId)
                  )
               await Promise.all([
                  setFieldValue(
                     "questions.registrationQuestions",
                     registrationQuestionsFiltered
                  ),
                  setFieldValue("questions.hosts", value),
               ])
            }}
            getOptionDisabled={(group) => group.id === currentGroup.groupId}
            renderTags={(value: Group[], getTagProps) => {
               const sortedValues = value.sort((a, b) =>
                  a.universityName.localeCompare(b.universityName)
               )
               return sortedValues.map((option, index) => {
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
         <GroupedRegistrationQuestions allGroups={allGroups} />
      </>
   )
}

export default RegistrationQuestionsListForCFAdmin
