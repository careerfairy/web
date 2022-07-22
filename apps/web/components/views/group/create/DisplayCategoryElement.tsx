import React, { useMemo } from "react"
import { Box, Chip, Paper } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import {
   convertGroupQuestionOptionsToSortedArray,
   GroupQuestion,
} from "@careerfairy/shared-lib/dist/groups"

const styles = sxStyles({
   whiteBox: {
      backgroundColor: "white",
      borderRadius: "5px",
      padding: "20px",
      margin: "10px 0",
      textAlign: "left",
      display: "flex",
      flexWrap: "wrap",
   },
   label: {
      fontSize: "0.8em",
      fontWeight: "700",
      color: "rgb(160,160,160)",
      margin: "0 0 5px 0",
   },
})

interface Props {
   category: GroupQuestion
}
const DisplayCategoryElement = ({ category }: Props) => {
   const optionsArray = useMemo(
      () => convertGroupQuestionOptionsToSortedArray(category.options),
      [category.options]
   )

   return (
      <Paper sx={styles.whiteBox}>
         <Box style={{ minWidth: "120px" }}>
            <Box sx={styles.label}>Category Name</Box>
            <Box>{category.name}</Box>
         </Box>
         <Box style={{ minWidth: "240px" }}>
            <Box sx={styles.label}>Category Options</Box>
            {optionsArray.map((option) => {
               return (
                  <Chip
                     key={option.id}
                     label={option.name}
                     variant="outlined"
                  />
               )
            })}
         </Box>
      </Paper>
   )
}

export default DisplayCategoryElement
