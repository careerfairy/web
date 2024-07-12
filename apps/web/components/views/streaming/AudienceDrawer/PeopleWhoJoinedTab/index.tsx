import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import {
   FormControl,
   Grid,
   InputLabel,
   MenuItem,
   Select,
   TextField,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { Fragment, useEffect, useState } from "react"
import { isEmpty, isLoaded } from "react-redux-firebase"
import EmptyDisplay from "../displays/EmptyDisplay"
import LoadingDisplay from "../displays/LoadingDisplay"
import UserList from "./UserList"

const useStyles = makeStyles((theme) => ({
   searchGridWrapper: {
      padding: theme.spacing(1, 1, 0, 1),
   },
}))
const TALENT_POOL_OPTION = "Talent pool"
const ALL_OPTION = "All"
const options = [ALL_OPTION, TALENT_POOL_OPTION]

interface Props {
   participatingStudents: UserLivestreamData[]
   isStreamer: boolean
}
const PeopleWhoJoinedTab = ({ isStreamer, participatingStudents }: Props) => {
   const classes = useStyles()

   const [searchParams, setSearchParams] = useState("")
   const [currentOption, setCurrentOption] = useState(options[0])

   const [filteredAudience, setFilteredAudience] = useState(undefined)

   const handleFilter = (arrayOfUserObjects: UserLivestreamData[]) => {
      if (!arrayOfUserObjects) return arrayOfUserObjects
      let filtered = arrayOfUserObjects.filter(
         (data) =>
            data.user.firstName?.toLowerCase().includes(searchParams) ||
            data.user.lastName?.toLowerCase().includes(searchParams) ||
            data.user.university?.name?.toLowerCase().includes(searchParams)
      )
      if (currentOption === TALENT_POOL_OPTION) {
         filtered = filtered.filter((userData) => userData.talentPool?.date)
      }
      return filtered
   }

   useEffect(() => {
      setFilteredAudience(handleFilter(participatingStudents))
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [participatingStudents, searchParams, currentOption])

   const handleSearch = (e) => {
      setSearchParams(e.currentTarget.value.toLowerCase())
   }
   const handleFilterOptions = (e) => {
      const value = e.target.value
      setCurrentOption(value)
   }

   return (
      <Fragment>
         <Grid className={classes.searchGridWrapper} container spacing={1}>
            <Grid item xs={isStreamer ? 9 : 12}>
               <TextField
                  fullWidth
                  value={searchParams}
                  variant="standard"
                  onChange={handleSearch}
                  label="Search for people..."
               />
            </Grid>
            {Boolean(isStreamer) && (
               <Grid item xs={3}>
                  <FormControl variant="standard" fullWidth>
                     <InputLabel id="audience-select">filter:</InputLabel>
                     <Select
                        labelId="audience-select"
                        id="audience-select"
                        label="filter:"
                        value={currentOption}
                        onChange={handleFilterOptions}
                     >
                        {options.map((option) => (
                           <MenuItem key={option} value={option}>
                              {option}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>
            )}
         </Grid>
         {!isLoaded(participatingStudents) ? (
            <LoadingDisplay />
         ) : isEmpty(participatingStudents) ? (
            <EmptyDisplay text="Not enough data" />
         ) : (
            <UserList isStreamer={isStreamer} audience={filteredAudience} />
         )}
      </Fragment>
   )
}

export default PeopleWhoJoinedTab
