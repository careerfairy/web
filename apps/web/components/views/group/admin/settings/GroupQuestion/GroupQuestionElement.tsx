import {
   Group,
   GroupQuestion,
   GroupQuestionOption,
   convertGroupQuestionOptionsToSortedArray,
} from "@careerfairy/shared-lib/groups"
import EditIcon from "@mui/icons-material/Edit"
import {
   Card,
   CardContent,
   CardHeader,
   Chip,
   Divider,
   Fade,
   IconButton,
} from "@mui/material"
import { Fragment, useMemo, useState } from "react"
import GroupQuestionEdit from "./GroupQuestionEdit"

interface Props {
   handleUpdateGroupQuestion?: (category: GroupQuestion) => void
   GroupQuestion: GroupQuestion
   handleDeleteLocalGroupQuestion?: (categoryId: string) => void
   group?: Group
   isLocal?: boolean
}

const GroupQuestionElement = ({
   handleUpdateGroupQuestion,
   GroupQuestion,
   handleDeleteLocalGroupQuestion,
   group,
   isLocal,
}: Props) => {
   const [editMode, setEditMode] = useState(false)
   const hidden = Boolean(GroupQuestion.hidden)
   const options = useMemo<GroupQuestionOption[]>(() => {
      return convertGroupQuestionOptionsToSortedArray(GroupQuestion.options)
   }, [GroupQuestion])

   const optionElements = options.map((option, index) => {
      return (
         <Chip
            key={option.id || index}
            label={option.name}
            className={"stacked"}
            variant="outlined"
         />
      )
   })

   if (editMode === false) {
      return (
         <Fade in>
            <Card elevation={1}>
               <CardHeader
                  titleTypographyProps={{
                     gutterBottom: true,
                     color: hidden ? "textSecondary" : "textPrimary",
                  }}
                  title={<>{GroupQuestion.name}</>}
                  action={
                     <IconButton
                        onClick={() => setEditMode(true)}
                        aria-label="settings"
                        size="large"
                     >
                        <EditIcon color="primary" />
                     </IconButton>
                  }
                  subheader="Category Options"
               />
               <Divider />
               <CardContent>{optionElements}</CardContent>
            </Card>
         </Fade>
      )
   }

   return (
      <Fragment>
         <GroupQuestionEdit
            group={group}
            isLocal={isLocal}
            handleUpdateGroupQuestion={handleUpdateGroupQuestion}
            handleDeleteLocalGroupQuestion={handleDeleteLocalGroupQuestion}
            groupQuestion={GroupQuestion}
            setEditMode={setEditMode}
         />
      </Fragment>
   )
}

export default GroupQuestionElement
