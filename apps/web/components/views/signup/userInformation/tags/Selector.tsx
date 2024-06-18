import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { Chip, Grid } from "@mui/material"
import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { useDebounce } from "react-use"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   chip: {
      mr: "8px",
      mt: "8px",
      p: "14px 6px",
      borderRadius: "60px",

      border: (theme) => `1px solid ${theme.palette.secondary.light}`,
      background: (theme) => theme.brand.white[300],
      color: (theme) => theme.palette.neutral[700],
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
      "&:last-child": {
         mr: "0px",
      },
   },
   selectedChip: {
      borderRadius: "60px",
      border: (theme) => `1px solid ${theme.palette.secondary.light}`,
      background: (theme) => theme.palette.primary.main,
      color: (theme) => theme.brand.white[50],
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "20px",
   },
})

type TagsMap = {
   [k: string]: {
      state: boolean
      option: OptionGroup
   }
}

type SelectorProps = {
   handleInterestTagChange: (
      userEmail: string,
      name: string,
      selectedTags: OptionGroup[]
   ) => Promise<void>
   tags: OptionGroup[]
   field: "businessFunctionsTagIds" | "contentTopicsTagIds"
}

export const Selector = ({
   handleInterestTagChange,
   tags,
   field,
}: SelectorProps) => {
   const { userData } = useAuth()

   const [userTags, setUserTags] = useState<TagsMap>(() => {
      return Object.fromEntries(
         tags.map((tag) => {
            return [
               tag.id,
               {
                  state: userData[field]?.includes(tag.id) || false,
                  option: tag,
               },
            ]
         })
      )
   })

   const updatedTags = Object.keys(userTags)
      .filter((id) => userTags[id].state)
      .map((id) => userTags[id].option)

   useDebounce(() => handleTagChangeDebounced(updatedTags), 100, [updatedTags])

   const handleTagChangeDebounced = useCallback(
      async (selectedTags: OptionGroup[]) => {
         return await handleInterestTagChange(
            userData.userEmail,
            field,
            selectedTags
         )
      },
      [field, handleInterestTagChange, userData.userEmail]
   )

   return (
      <>
         <TagValuesSelector
            tagIds={Object.keys(userTags)}
            tagsMap={userTags}
            setUserTags={setUserTags}
            field={field}
         />
      </>
   )
}

type TagValuesSelectorProps = {
   tagIds: string[]
   tagsMap: TagsMap
   field: string
   setUserTags: Dispatch<SetStateAction<TagsMap>>
}

const TagValuesSelector = ({
   tagIds: tagIds,
   tagsMap: tagsMap,
   setUserTags: setUserTags,
   field,
}: TagValuesSelectorProps) => {
   return (
      <Grid container spacing={2} justifyContent="center">
         <Grid container>
            {tagIds.map((tagId) => {
               return (
                  <Chip
                     data-testid={`${field}_${tagId}_option`}
                     onClick={() => {
                        const selected = tagsMap[tagId]

                        const functions = {
                           ...tagsMap,
                        }

                        functions[tagId].state = !selected.state

                        setUserTags(functions)
                     }}
                     clickable
                     sx={[
                        styles.chip,
                        tagsMap[tagId].state ? styles.selectedChip : null,
                     ]}
                     key={tagId}
                     label={tagsMap[tagId].option.name}
                  />
               )
            })}
         </Grid>
      </Grid>
   )
}
export default Selector
