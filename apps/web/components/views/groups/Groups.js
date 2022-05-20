import React, { Fragment, useState } from "react"
import { Button, Grid, TextField } from "@mui/material"
import NewGroup from "../profile/NewGroup"
import Autocomplete from "@mui/material/Autocomplete"
import parse from "autosuggest-highlight/parse"
import match from "autosuggest-highlight/match"
import Link from "next/link"

export const Highlights = ({
   groups,
   handleSelectGroup,
   absolutePath = undefined,
   hideButton,
}) => {
   return (
      <div
         style={{
            position: "sticky",
            zIndex: 10,
            marginBottom: 10,
            display: "flex",
         }}
      >
         <Autocomplete
            options={groups}
            selectOnFocus
            fullWidth
            autoHighlight
            onChange={handleSelectGroup}
            getOptionLabel={(option) =>
               option.universityName ? option.universityName : ""
            }
            renderInput={(params) => (
               <TextField
                  {...params}
                  style={{ backgroundColor: "white", margin: 0 }}
                  placeholder="Join some groups"
                  label="Search"
                  fullWidth
                  variant="outlined"
                  margin="normal"
               />
            )}
            renderOption={(props, option, { inputValue }) => {
               const matches = match(option.universityName, inputValue)
               const parts = parse(option.universityName, matches)
               const key = `listItem-${option.groupId}-${option.id}`
               return (
                  <li {...props} key={key}>
                     <div>
                        {parts.map((part, index) => (
                           <span
                              key={index + part.text}
                              style={{
                                 fontWeight: part.highlight ? 700 : 400,
                              }}
                           >
                              {part.text}
                           </span>
                        ))}
                     </div>
                  </li>
               )
            }}
         />
         {absolutePath || hideButton ? null : (
            <Link href="/next-livestreams">
               <a>
                  <Button
                     style={{ marginLeft: "0.5rem" }}
                     disableElevation
                     color="primary"
                     variant="contained"
                  >
                     To next livestreams
                  </Button>
               </a>
            </Link>
         )}
      </div>
   )
}

const Groups = ({
   groups,
   userData,
   makeSix,
   absolutePath,
   hideNextLiveStreamsButton,
}) => {
   const [selectedGroup, setSelectedGroup] = useState(null)

   const handleSelectGroup = (event, value) => {
      setSelectedGroup(value)
   }

   let moreGroupElements = []

   moreGroupElements = groups.map((group) => {
      return (
         <NewGroup
            makeSix={makeSix}
            key={group.id}
            group={group}
            userData={userData}
         />
      )
   })
   return (
      <Fragment>
         <Highlights
            handleSelectGroup={handleSelectGroup}
            absolutePath={absolutePath}
            groups={groups}
            hideButton={!!hideNextLiveStreamsButton}
         />
         <Grid style={{ marginBottom: makeSix ? 0 : 50 }} container spacing={3}>
            {selectedGroup ? (
               <NewGroup
                  selected={true}
                  makeSix={makeSix}
                  group={selectedGroup}
                  userData={userData}
               />
            ) : (
               moreGroupElements
            )}
         </Grid>
      </Fragment>
   )
}

export default Groups
