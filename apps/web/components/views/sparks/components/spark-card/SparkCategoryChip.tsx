import {
   SparkCategory,
   getCategoryById,
   getCategoryEmoji,
} from "@careerfairy/shared-lib/sparks/sparks"
import { Chip } from "@mui/material"
import { FC, useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      bgcolor: "primary.600",
   },
})

type Props = {
   categoryId: SparkCategory["id"]
}

const SparkCategoryChip: FC<Props> = ({ categoryId }) => {
   const label = useMemo(() => {
      const cat = getCategoryById(categoryId)
      const emoji = getCategoryEmoji(categoryId)

      return `${emoji} ${cat.name}`
   }, [categoryId])

   return (
      <span>
         <Chip color="primary" label={label} sx={styles.root} />
      </span>
   )
}

export default SparkCategoryChip
