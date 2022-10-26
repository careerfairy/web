import React, { useCallback, useMemo } from "react"
import MultiListSelect from "../common/MultiListSelect"
import { Group, GroupQuestion } from "@careerfairy/shared-lib/dist/groups"
import useCollection from "../../custom-hook/useCollection"
import { Grid } from "@mui/material"
import { FormikHelpers } from "formik"
import { DraftFormValues } from "./DraftStreamForm"
import {
   LivestreamGroupQuestion,
   LivestreamGroupQuestions,
} from "@careerfairy/shared-lib/dist/livestreams"
import { groupRepo } from "../../../data/RepositoryInstances"

interface Props {
   group: Group
   disabled?: boolean
   setFieldValue?: FormikHelpers<DraftFormValues>["setFieldValue"]
   values?: DraftFormValues
   isSubmitting: boolean
   isGroupAdmin: (groupId: string) => boolean
}
const GroupQuestionSelect = ({
   group,
   setFieldValue,
   values,
   isGroupAdmin,
   isSubmitting,
}: Props) => {
   const query = useMemo(
      () => groupRepo.getGroupCustomQuestionsQuery(group.id),
      [group.id]
   )

   const { data: questions, isLoading: isLoadingQuestions } =
      useCollection<GroupQuestion>(query, true)

   const getLabelFn = useCallback(
      (question: GroupQuestion) => question.name,
      []
   )
   const selectedItems = useMemo(() => {
      if (!values.groupQuestionsMap?.[group.id]?.questions) return []
      return Object.values(values.groupQuestionsMap[group.id].questions)
   }, [group.id, values.groupQuestionsMap])

   const disabledValues = useMemo(
      () => (isGroupAdmin(group.id) ? [] : questions.map((q) => q.id)),
      [group.id, isGroupAdmin, questions]
   )

   const onSelectItems = useCallback(
      (selectedItems: GroupQuestion[]) => {
         if (!setFieldValue) return
         const groupQuestionsMap: LivestreamGroupQuestions = {
            groupId: group.id,
            groupName: group.universityName,
            universityCode: group.universityCode || null,
            questions: selectedItems.reduce<
               Record<string, LivestreamGroupQuestion>
            >(
               (acc, question) => ({
                  ...acc,
                  [question.id]: question,
               }),
               {}
            ),
         }
         setFieldValue(`groupQuestionsMap.${group.id}`, groupQuestionsMap)
      },
      [setFieldValue, group]
   )
   const inputProps = useMemo(
      () => ({
         label: `Questions that ${group.universityName} has for Event Registration`,
         placeholder:
            "Add some Questions you'd like to ask on event registration",
      }),
      [group.universityName]
   )

   if (isLoadingQuestions || !questions.length) return null

   return (
      <Grid xs={12} item>
         <MultiListSelect
            inputName={`groupQuestionsMap.${group.id}`}
            onSelectItems={onSelectItems}
            selectedItems={selectedItems}
            isCheckbox
            allValues={questions}
            disabled={!isGroupAdmin(group.id) || isSubmitting}
            getLabelFn={getLabelFn}
            inputProps={inputProps}
            disabledValues={disabledValues}
            chipProps={{
               variant: "contained",
               color: "secondary",
            }}
            checkboxColor="secondary"
         />
      </Grid>
   )
}

export default GroupQuestionSelect
