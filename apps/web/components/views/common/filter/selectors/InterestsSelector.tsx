import { FormControl } from "@mui/material"
import Typography from "@mui/material/Typography"
import MultiCheckboxSelect from "../../MultiCheckboxSelect"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import React, { useCallback } from "react"
import { useInterests } from "../../../../custom-hook/useCollection"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useRouter } from "next/router"

type Props = {
   handleChange: (name: string, selectedOptions: OptionGroup[]) => void
}

const InterestsSelector = ({ handleChange }: Props) => {
   const { data: interests } = useInterests()
   const { query } = useRouter()

   const getSelectedTags = useCallback((): OptionGroup[] => {
      const queryTags = query.interests as string
      let selectedTags = []

      if (queryTags) {
         selectedTags = formatToOptionArray(queryTags.split(","), interests)
      }
      return selectedTags
   }, [interests, query.interests])

   return interests.length > 0 ? (
      <FormControl key="tags-select" variant={"outlined"} fullWidth>
         <Typography
            htmlFor="tags-select"
            component={"label"}
            variant={"h5"}
            fontWeight={600}
            id={"tags-select-label"}
         >
            Tags
         </Typography>
         <MultiCheckboxSelect
            inputName={"interests"}
            selectedItems={getSelectedTags()}
            allValues={interests}
            setFieldValue={handleChange}
            getValueFn={multiListSelectMapValueFn}
         />
      </FormControl>
   ) : null
}

export default InterestsSelector
