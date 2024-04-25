import { Group } from "@careerfairy/shared-lib/groups"
import { Chip } from "@mui/material"
import { useMemo } from "react"
import { hashToColor } from "../../commons"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import MultiChipSelect from "../general/components/MultiChipSelect"
import InputSkeleton from "./InputSkeleton"
import LoadErrorMessage from "./LoadErrorMessage"
import { RegistrationQuestionFormValues } from "./commons"
import { useGroupsQuestions } from "./useGroupsQuestions"

const buildGroupNameMap = (groups: Group[]) => {
   return groups?.reduce(
      (result, group) => ({
         ...result,
         [group.groupId]: group.universityName,
      }),
      {}
   )
}

type GroupedRegistrationQuestionsProps = {
   allGroups: Group[]
}

const GroupedRegistrationQuestions = ({
   allGroups,
}: GroupedRegistrationQuestionsProps) => {
   const {
      values: { questions },
   } = useLivestreamFormValues()
   const { groupsQuestions, isLoading, isValidating, error } =
      useGroupsQuestions(questions.hosts)

   const groupNameMap = useMemo(() => buildGroupNameMap(allGroups), [allGroups])

   if (error) {
      return <LoadErrorMessage label="questions" />
   }

   if (isLoading || isValidating) {
      return <InputSkeleton />
   }

   return (
      <MultiChipSelect
         id="questions.registrationQuestions.values"
         options={groupsQuestions}
         value={questions.registrationQuestions.values}
         multiple
         disableCloseOnSelect
         textFieldProps={{
            label: "Questions for live stream registration",
            placeholder:
               "Add some questions you'd like to ask on event registration",
         }}
         getOptionLabel={(question: RegistrationQuestionFormValues) =>
            question?.name
         }
         groupBy={(group) => groupNameMap[group?.groupId]}
         renderTags={(value: RegistrationQuestionFormValues[], getTagProps) => {
            const sortedValues = value?.sort((a, b) =>
               a?.groupName.localeCompare(b?.groupName)
            )
            return sortedValues.map((option, index) => {
               return (
                  <Chip
                     key={option?.id}
                     {...getTagProps({ index })}
                     label={option?.name}
                     sx={{
                        backgroundColor: `${hashToColor(
                           option?.groupId
                        )} !important`,
                     }}
                  />
               )
            })
         }}
      />
   )
}

export default GroupedRegistrationQuestions
