import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { UserData } from "@careerfairy/shared-lib/users"
import { Chip, Grid } from "@mui/material"
import { useCallback } from "react"
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
   field: keyof Pick<
      UserData,
      "businessFunctionsTagIds" | "contentTopicsTagIds"
   >
}

export const Selector = ({
   handleInterestTagChange,
   tags,
   field,
}: SelectorProps) => {
   const { userData } = useAuth()

   const tagsMap: TagsMap = Object.fromEntries(
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

   const handleTagChange = useCallback(
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
            tagsMap={tagsMap}
            setUserTags={handleTagChange}
            field={field}
         />
      </>
   )
}

type TagValuesSelectorProps = {
   tagsMap: TagsMap
   field: string
   setUserTags: (selectedTags: OptionGroup[]) => Promise<void>
}

const TagValuesSelector = ({
   tagsMap: tagsMap,
   setUserTags: setUserTags,
   field,
}: TagValuesSelectorProps) => {
   return (
      <Grid container spacing={2} justifyContent="center">
         <Grid container>
            {Object.keys(tagsMap).map((tagId) => {
               return (
                  <Chip
                     data-testid={`${field}_${tagId}_option`}
                     onClick={() => {
                        const selected = tagsMap[tagId]

                        const tags = {
                           ...tagsMap,
                        }

                        tags[tagId].state = !selected.state
                        const upToDateTags = Object.keys(tags)
                           .filter((tagId) => tags[tagId].state)
                           .map((tagId) => tags[tagId].option)
                        setUserTags(upToDateTags)
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
