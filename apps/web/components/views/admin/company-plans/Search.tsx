import { Group } from "@careerfairy/shared-lib/groups"
import {
   Container,
   FormHelperText,
   Grid,
   InputAdornment,
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
         //  background: "rgba(255, 255, 255, 0.8)",
         backdropFilter: "blur(10px)",
      },
   },
})

const Search = () => {
   const [inputValue, setInputValue] = useState("")

   const options = useMemo<UseSearchOptions<Group>>(
      () => ({
         maxResults: 100,
         additionalConstraints: [where("test", "==", false)],
         emptyOrderBy: {
            field: "universityName",
            direction: "asc",
         },
      }),
      []
   )

   const { data: companyHits, status } = useGroupSearch(inputValue, options)

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
            InputProps={{
               startAdornment: (
                  <InputAdornment position="start">
                     <FindIcon color={"black"} />
                  </InputAdornment>
               ),
               autoComplete: "organization",
            }}
         />
         <FormHelperText sx={styles.helperText}>
            {inputValue.length < 3
               ? "Type a minimum of 3 characters to search"
               : ""}
         </FormHelperText>
         <Container disableGutters sx={styles.container} maxWidth={false}>
            <Grid container spacing={2.5}>
               {companyHits?.map((company) => (
                  <Grid item xs={12} md={6} lg={4} key={company.id}>
                     <CompanyPlanCard group={company} />
                  </Grid>
               ))}
            </Grid>
         </Container>
      </>
   )
}

export default Search
