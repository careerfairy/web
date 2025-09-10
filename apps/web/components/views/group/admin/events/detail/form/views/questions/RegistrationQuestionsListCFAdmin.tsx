import { Group } from "@careerfairy/shared-lib/groups"
import { Chip, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useEffect } from "react"
import { useLivestreamCreationContext } from "../../../LivestreamCreationContext"
import { hashToColor } from "../../commons"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import MultiChipSelect from "../general/components/MultiChipSelect"
import GroupedRegistrationQuestions from "./GroupedRegistrationQuestions"
import InputSkeleton from "./InputSkeleton"
import LoadErrorMessage from "./LoadErrorMessage"
import { useGroupsSWR } from "./useGroupsSWR"

const RegistrationQuestionsListForCFAdmin = () => {
   const { group: currentGroup } = useGroup()
   const {
      data: allGroups,
      isLoading: groupsLoading,
      isValidating: groupsValidating,
      error,
   } = useGroupsSWR()

   const { livestream } = useLivestreamCreationContext()
   const {
      values: { questions },
      setFieldValue,
   } = useLivestreamFormValues()

   useEffect(() => {
      if (!groupsLoading && !groupsValidating && !questions.hosts.length) {
         const initialValue = allGroups.filter((group) =>
            livestream.groupIds.includes(group.groupId)
         )
         setFieldValue("questions.hosts", initialValue)
      }
   }, [
      allGroups,
      groupsLoading,
      groupsValidating,
      livestream.groupIds,
      questions.hosts.length,
      setFieldValue,
   ])

   if (error) {
      return <LoadErrorMessage label="groups" />
   }

   if (groupsLoading || groupsValidating || !questions.hosts.length) {
      return (
         <Stack spacing={2}>
            <InputSkeleton />
            <InputSkeleton />
         </Stack>
      )
   }
   return (
      <SuspenseWithBoundary>
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
            isOptionEqualToValue={(option, value) =>
               option.groupId === value.groupId
            }
            getOptionLabel={(group: Group) =>
               group.universityName || "Untitled"
            }
            onChange={async (_, value) => {
               const registrationQuestionsFiltered =
                  questions.registrationQuestions.values.filter((question) =>
                     value.some((group) => group.groupId === question.groupId)
                  )
               await Promise.all([
                  setFieldValue(
                     "questions.registrationQuestions.values",
                     registrationQuestionsFiltered
                  ),
                  setFieldValue("questions.hosts", value),
               ])
            }}
            getOptionDisabled={(group) =>
               group.groupId === currentGroup.groupId
            }
            renderTags={(value: Group[], getTagProps) => {
               // Keep original indices to ensure getTagProps({ index }) maps to the correct item
               const withIndex = value.map((g, idx) => ({ option: g, idx }))

               const currentGroupId = currentGroup.groupId

               const current = withIndex.filter(
                  ({ option }) => option.groupId === currentGroupId
               )
               const rest = withIndex.filter(
                  ({ option }) => option.groupId !== currentGroupId
               )

               const ordered = [...current, ...rest]

               return ordered.map(({ option, idx }) => {
                  const isCurrent = option.groupId === currentGroupId
                  const isNonDeletable = isCurrent
                  const tagProps = getTagProps({ index: idx })

                  return (
                     <Chip
                        key={option.groupId}
                        {...tagProps}
                        disabled={isNonDeletable}
                        onDelete={
                           isNonDeletable ? undefined : tagProps.onDelete
                        }
                        label={option.universityName}
                        sx={[
                           {
                              backgroundColor: `${hashToColor(
                                 option.groupId
                              )} !important`,
                           },
                           isNonDeletable && {
                              opacity: "0.5 !important",
                           },
                        ]}
                     />
                  )
               })
            }}
         />
         <GroupedRegistrationQuestions allGroups={allGroups} />
      </SuspenseWithBoundary>
   )
}

export default RegistrationQuestionsListForCFAdmin
