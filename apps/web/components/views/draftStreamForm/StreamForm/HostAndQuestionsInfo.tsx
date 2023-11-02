import { Grid, Typography } from "@mui/material"
import React, { useCallback } from "react"
import FormGroup from "../FormGroup"
import MultiListSelect from "../../common/MultiListSelect"
import GroupQuestionSelect from "../GroupQuestionSelect"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import Section from "components/views/common/Section"
import { FormikHelpers } from "formik"
import { DraftFormValues } from "../DraftStreamForm"

type Props = {
   existingGroups: Group[]
   handleGroupSelect: (values, selectedGroups) => void
   values: any
   selectedGroups: Group[]
   isSubmitting: boolean
   isNotAdmin: boolean
   setFieldValue?: FormikHelpers<DraftFormValues>["setFieldValue"]
   isGroupAdmin: (groupId) => boolean
   groupId: string
   sectionRef: any
   classes: any
}

const HostAndQuestionsInfo = ({
   existingGroups,
   handleGroupSelect,
   values,
   selectedGroups,
   isSubmitting,
   isNotAdmin,
   setFieldValue,
   isGroupAdmin,
   groupId,
   sectionRef,
   classes,
}: Props) => {
   const handleGroupsIdsSelectItems = useCallback(
      (selectedGroups) => handleGroupSelect(values, selectedGroups),
      [handleGroupSelect, values]
   )

   return (
      <>
         {!!existingGroups.length && (
            <Section
               sectionRef={sectionRef}
               sectionId={"hostAndQuestionsSection"}
               className={classes.section}
            >
               <Typography fontWeight="bold" variant="h4">
                  Hosts and questions
               </Typography>
               <Typography variant="subtitle1" mt={1} color="textSecondary">
                  Add hosts and questions to your event
               </Typography>
               <FormGroup container boxShadow={0}>
                  <Grid xs={12} item>
                     <MultiListSelect
                        inputName="groupIds"
                        isCheckbox
                        onSelectItems={handleGroupsIdsSelectItems}
                        selectedItems={selectedGroups}
                        allValues={existingGroups}
                        disabled={isSubmitting || isNotAdmin}
                        getLabelFn={mapGroupLabel}
                        setFieldValue={setFieldValue}
                        inputProps={{
                           label: "Event Hosts",
                           placeholder: "Add some Hosts to your event",
                        }}
                        disabledValues={
                           isNotAdmin
                              ? existingGroups.map((g) => g.id)
                              : [groupId]
                        }
                        chipProps={{
                           variant: "contained",
                           color: "secondary",
                        }}
                        getListLabelFn={mapGroupLabel}
                        checkboxColor="secondary"
                     />
                  </Grid>
                  {selectedGroups.map((group) => {
                     return (
                        <GroupQuestionSelect
                           key={group.id}
                           group={group}
                           isSubmitting={isSubmitting}
                           isGroupAdmin={isGroupAdmin}
                           values={values}
                           setFieldValue={setFieldValue}
                        />
                     )
                  })}
               </FormGroup>
            </Section>
         )}
      </>
   )
}

const mapGroupLabel = (obj) => obj.universityName

export default HostAndQuestionsInfo
