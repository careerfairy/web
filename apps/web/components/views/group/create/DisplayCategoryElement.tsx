import {
   GroupQuestion,
   convertGroupQuestionOptionsToSortedArray,
} from "@careerfairy/shared-lib/groups"
import { Box, Card, Chip } from "@mui/material"
import { useMemo } from "react"
import { sxStyles } from "../../../../types/commonTypes"

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
      <Card sx={styles.whiteBox}>
         <Box style={{ minWidth: "120px" }}>
            <Box sx={styles.label}>Question Name</Box>
            <Box>{category.name}</Box>
         </Box>
         <Box style={{ minWidth: "240px" }}>
            <Box sx={styles.label}>Question Options</Box>
            {optionsArray.map((option) => {
               return (
                  <Chip
                     key={option.id}
                     label={option.name}
                     variant="outlined"
                     className="stacked"
                  />
               )
            })}
         </Box>
      </Card>
   )
}

export default DisplayCategoryElement
