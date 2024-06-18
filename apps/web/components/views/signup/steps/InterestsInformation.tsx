import {
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
} from "@careerfairy/shared-lib/constants/tags"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { Chip, Grid, Stack, Typography } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { userRepo } from "data/RepositoryInstances"
import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { useDebounce } from "react-use"
import { errorLogAndNotify } from "util/CommonUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../types/commonTypes"
import { mapOptions } from "../utils"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
      mx: "3px",
      mb: "6px",
   },
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

const InterestsInformation = () => {
   const { userData } = useAuth()

   const handleSelectedInterestsChange = useCallback(
      async (userEmail: string, name: string, selectedTags: OptionGroup[]) => {
         try {
            return await userRepo.updateAdditionalInformation(userEmail, {
               [name]: mapOptions(selectedTags),
            })
         } catch (error) {
            errorLogAndNotify(error)
         }
      },
      []
   )

   const BUSINESS_FUNCTIONS_INTERESTS_LABEL =
      "What kind of work are you excited about?"

   const CONTENT_TOPIC_INTERESTS_LABEL =
      "Choose the topics that spark your curiosity!"

   return (
      <ConditionalWrapper condition={Boolean(userData)}>
         <Stack
            gap={"32px"}
            direction={"column"}
            spacing={2}
            data-testid={"registration-interests-information-step"}
         >
            <UserInterestTagsInformation
               handleInterestTagChange={handleSelectedInterestsChange}
               tags={ContentTopicsTagValues}
               field="contentTopicsTagIds"
               label={CONTENT_TOPIC_INTERESTS_LABEL}
            />
            <UserInterestTagsInformation
               handleInterestTagChange={handleSelectedInterestsChange}
               tags={BusinessFunctionsTagValues}
               field="businessFunctionsTagIds"
               label={BUSINESS_FUNCTIONS_INTERESTS_LABEL}
            />
         </Stack>
      </ConditionalWrapper>
   )
}

type UserInterestTagsInformationProps = {
   handleInterestTagChange: (
      userEmail: string,
      name: string,
      selectedTags: OptionGroup[]
   ) => Promise<void>
   tags: OptionGroup[]
   field: "businessFunctionsTagIds" | "contentTopicsTagIds"
   label: string
}

const UserInterestTagsInformation = ({
   handleInterestTagChange,
   tags,
   field,
   label,
}: UserInterestTagsInformationProps) => {
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

   useDebounce(() => handleTagChangeDebounced(updatedTags), 10, [updatedTags])

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
         <TagInterests
            label={label}
            tagIds={Object.keys(userTags)}
            tagsMap={userTags}
            setUserTags={setUserTags}
            field={field}
         />
      </>
   )
}

type TagInterestsProps = {
   label: string
   tagIds: string[]
   tagsMap: TagsMap
   field: string
   setUserTags: Dispatch<SetStateAction<TagsMap>>
}
const TagInterests = ({
   label,
   tagIds: tagIds,
   tagsMap: tagsMap,
   setUserTags: setUserTags,
   field,
}: TagInterestsProps) => {
   return (
      <Grid container spacing={2} justifyContent="center">
         <Grid container>
            <Typography sx={styles.inputLabel} variant="h5">
               {label}
            </Typography>
         </Grid>
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
export default InterestsInformation
