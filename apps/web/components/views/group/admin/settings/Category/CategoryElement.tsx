import React, { Fragment, useMemo, useState } from "react"
import EditIcon from "@mui/icons-material/Edit"
import CategoryEdit from "./CategoryEdit"
import {
   Card,
   CardContent,
   CardHeader,
   Chip,
   Divider,
   Fade,
   IconButton,
   Tooltip,
} from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import {
   convertCategoryOptionsToSortedArray,
   CustomCategory,
   CustomCategoryOption,
   Group,
} from "@careerfairy/shared-lib/dist/groups"

const styles = sxStyles({
   hiddenChip: {
      marginLeft: 1,
   },
})

interface Props {
   handleUpdateCategory?: (category: CustomCategory) => void
   category: CustomCategory
   handleDeleteLocalCategory?: (categoryId: string) => void
   group?: Group
   isLocal?: boolean
}

const CategoryElement = ({
   handleUpdateCategory,
   category,
   handleDeleteLocalCategory,
   group,
   isLocal,
}: Props) => {
   const [editMode, setEditMode] = useState(false)
   const hidden = Boolean(category.hidden)
   const options = useMemo<CustomCategoryOption[]>(() => {
      return convertCategoryOptionsToSortedArray(category.options)
   }, [category])

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
                  title={
                     <>
                        {category.name}
                        {hidden && (
                           <Tooltip title="This information will not be collected from viewers who register to your events.">
                              <Chip
                                 sx={styles.hiddenChip}
                                 variant="outlined"
                                 color="secondary"
                                 label="Hidden From Registration"
                              />
                           </Tooltip>
                        )}
                     </>
                  }
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
         <CategoryEdit
            group={group}
            isLocal={isLocal}
            handleUpdateCategory={handleUpdateCategory}
            handleDeleteLocalCategory={handleDeleteLocalCategory}
            category={category}
            setEditMode={setEditMode}
         />
      </Fragment>
   )
}

export default CategoryElement
