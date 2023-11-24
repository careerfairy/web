import { Group } from "@careerfairy/shared-lib/groups"
import { COPY_CONSTANTS } from "@careerfairy/shared-lib/constants"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import {
   Box,
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
import { useInView } from "react-intersection-observer"

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
      position: "relative",
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
   bottomNode: {
      position: "absolute",
      bottom: 200,
   },
})

const INITIAL_MAX_RESULTS = 10

const Search = () => {
   const [inputValue, setInputValue] = useState("")
   const [blured, setBlured] = useState<boolean>()
   const [maxResults, setMaxResults] = useState(INITIAL_MAX_RESULTS)

   const [bottomRef] = useInView({
      onChange: (inView) => {
         if (inView) {
            // Load more results
            setMaxResults(
               (prevMaxResults) => prevMaxResults + INITIAL_MAX_RESULTS
            )
         }
      },
   })

   const options = useMemo<UseSearchOptions<Group>>(
      () => ({
         maxResults,
         additionalConstraints: [where("test", "==", false)],
         emptyOrderBy: {
            field: "normalizedUniversityName",
            direction: "asc",
         },
      }),
      [maxResults]
   )

   const { data: groups, status } = useGroupSearch(inputValue, options)

   const presenters = useMemo(
      () => groups?.map(GroupPresenter.createFromDocument) ?? [],
      [groups]
   )

   const isLoading = status === "loading"
   const isInputTooSmall = inputValue.length < 3

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
         <Grow in={blured ? isInputTooSmall : null}>
            <FormHelperText sx={styles.helperText}>
               {isInputTooSmall
                  ? COPY_CONSTANTS.FORMS.MIN_SEARCH_CHARACTERS
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
            <Box sx={styles.bottomNode} ref={isLoading ? null : bottomRef} />
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
