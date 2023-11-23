import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import {
   CircularProgress,
   Container,
   FormHelperText,
   Grid,
   Grow,
   InputAdornment,
   InputProps,
   TextField,
} from "@mui/material"
import useGroupSearch from "components/custom-hook/group/useGroupSearch"
import { UseSearchOptions } from "components/custom-hook/utils/useSearch"
import { where } from "firebase/firestore"
import { useMemo, useState } from "react"
import { Search as FindIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CompanyPlanCard from "./CompanyPlanCard"

const styles = sxStyles({
   root: {
      pt: 3.375,
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
   },
   helperText: {
      height: 24,
   },
   container: {
      maxWidth: 1160,
   },
   input: {
      position: "sticky",
      top: 10,
      zIndex: 1,
      "& .MuiInputBase-root": {
         overflow: "hidden",
         backdropFilter: "blur(10px)",
      },
   },
   loader: {
      mx: "auto",
      mt: 5,
   },
})

const Search = () => {
   const [inputValue, setInputValue] = useState("")
   const [blured, setBlured] = useState<boolean>()

   const options = useMemo<UseSearchOptions<Group>>(
      () => ({
         maxResults: 100,
         additionalConstraints: [where("test", "==", false)],
         emptyOrderBy: {
            field: "normalizedUniversityName",
            direction: "asc",
         },
      }),
      []
   )

   const { data: groups, status } = useGroupSearch(inputValue, options)

   const isLoading = status === "loading"

   const presenters = useMemo(
      () => groups?.map(GroupPresenter.createFromDocument) ?? [],
      [groups]
   )

   return (
      <>
         <TextField
            sx={styles.input}
            placeholder="Search for a company"
            label="Company name"
            autoFocus
            fullWidth
            margin="normal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => setBlured(true)}
            InputProps={inputProps}
         />
         <Grow in={blured ? inputValue.length < 3 : null}>
            <FormHelperText sx={styles.helperText}>
               {inputValue.length < 3
                  ? "Type a minimum of 3 characters to search"
                  : ""}
            </FormHelperText>
         </Grow>
         <Container disableGutters sx={styles.container} maxWidth={false}>
            <Grid container spacing={2.5}>
               {isLoading ? (
                  <CircularProgress sx={styles.loader} />
               ) : (
                  presenters.map((presenter) => (
                     <Grid item xs={12} md={6} lg={4} key={presenter.id}>
                        <CompanyPlanCard presenter={presenter} />
                     </Grid>
                  ))
               )}
            </Grid>
         </Container>
      </>
   )
}

const inputProps: Partial<InputProps> = {
   startAdornment: (
      <InputAdornment position="start">
         <FindIcon color={"black"} />
      </InputAdornment>
   ),
   autoComplete: "organization",
}

export default Search
