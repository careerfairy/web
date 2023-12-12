import AutocompleteSearch from "../../../common/AutocompleteSearch"
import { Search as FindIcon } from "react-feather"
import { Box, Card } from "@mui/material"
import React, { FC, useCallback, useState } from "react"
import { sxStyles } from "../../../../../types/commonTypes"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import { useRouter } from "next/router"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { getParts } from "../../../../util/search"
import RenderParts from "../../../common/search/RenderParts"
import { SortedJobs } from "./JobList"

const styles = sxStyles({
   search: {
      display: "flex",
      alignItems: "center",
      height: "40px",
      borderRadius: "20px",
      boxShadow: "unset",
   },
})

type Props = {
   options: SortedJobs[]
}
const JobSearch: FC<Props> = ({ options }) => {
   const { push } = useRouter()
   const { group } = useGroupFromState()
   const [inputValue, setInputValue] = useState("")

   const handleChange = useCallback(
      (newValue: PublicCustomJob | null) =>
         push(`/group/${group.groupId}/admin/jobs/${newValue.id}`),
      [group.groupId, push]
   )

   return (
      <Card sx={styles.search}>
         <AutocompleteSearch
            id="jobs-search"
            minCharacters={3}
            inputValue={inputValue}
            handleChange={handleChange}
            options={options}
            renderOption={renderOption}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={getOptionLabel}
            setInputValue={setInputValue}
            noOptionsText="No jobs found"
            placeholderText="Search"
            inputStartIcon={<FindIcon />}
         />
      </Card>
   )
}

const renderOption = (
   props: React.HTMLAttributes<HTMLLIElement>,
   option: PublicCustomJob,
   state: AutocompleteRenderOptionState
) => {
   const titleParts = getParts(option.title, state.inputValue)

   return (
      <Box {...props} component={"li"} key={option.id}>
         <RenderParts parts={titleParts} />
      </Box>
   )
}

const isOptionEqualToValue = (
   option: PublicCustomJob,
   value: PublicCustomJob
) => option.id === value.id

const getOptionLabel = (option: PublicCustomJob) => option.title
export default JobSearch
