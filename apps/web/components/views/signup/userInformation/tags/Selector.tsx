import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { UserData } from "@careerfairy/shared-lib/users"
import { Chip, Grid } from "@mui/material"
import { useCallback } from "react"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   chip: (theme) => ({
      mr: "8px",
      mt: "8px",
      p: "14px 6px",
      borderRadius: "60px",
      border: `1px solid ${theme.palette.secondary.light}`,
      background: theme.brand.white[300],
      color: theme.palette.neutral[700],
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
      "&:last-child": {
         mr: "0px",
      },
   }),
   selectedChip: (theme) => ({
      borderRadius: "60px",
      border: `1px solid ${theme.palette.secondary.light}`,
      background: theme.palette.primary.main,
      color: theme.brand.white[50],
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "20px",
   }),
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
      <Grid container spacing={2}>
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
                     handleTagChange(upToDateTags)
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
   )
}
