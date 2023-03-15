import React, { useEffect, useMemo, useState } from "react"
import {
   Box,
   Button,
   CircularProgress,
   Fade,
   Grid,
   InputAdornment,
   Tab,
   Tabs,
   TextField,
   Typography,
} from "@mui/material"
import { useRouter } from "next/router"
import CurrentGroup from "components/views/profile/CurrentGroup"
import makeStyles from "@mui/styles/makeStyles"
import useInfiniteScrollClientWithHandlers from "../../../custom-hook/useInfiniteScrollClientWithHandlers"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import { useAuth } from "../../../../HOCs/AuthProvider"
import Link from "../../common/Link"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import { groupRepo } from "../../../../data/RepositoryInstances"
import Autocomplete from "@mui/material/Autocomplete"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { UserAdminGroup } from "@careerfairy/shared-lib/dist/users"
import { Search as FindIcon } from "react-feather"

const useStyles = makeStyles((theme) => ({
   header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
      flexWrap: "wrap",
   },
   title: {
      color: theme.palette.text.secondary,
      margin: "0 0 10px 0",
      fontWeight: "300",
   },
}))

const initialTabs = [
   {
      label: "Groups you've joined",
      value: "joined",
      href: "/profile/groups?type=joined",
   },
]

const adminTab = {
   label: "Groups you manage",
   value: "admin",
   href: "/profile/groups?type=admin",
}

type Props = {
   isOnDialog?: boolean
}

const Groups = ({ isOnDialog = false }: Props) => {
   const classes = useStyles()
   const { userData, authenticatedUser, adminGroups } = useAuth()
   const { errorNotification } = useSnackbarNotifications()
   const {
      query: { type },
   } = useRouter()
   const [loading, setLoading] = useState(false)

   const [groups, setGroups] = useState<(Group | UserAdminGroup)[]>([])

   const [value, setValue] = useState<"joined" | "admin" | null>(null)

   const [hasAdminGroups, setHasAdminGroups] = useState<undefined | boolean>(
      userData?.isAdmin
   )
   const [selectedGroup, setSelectedGroup] = useState(null)
   const [tabs, setTabs] = useState([
      ...initialTabs,
      ...(hasAdminGroups ? [adminTab] : []),
   ])

   useEffect(() => {
      ;(async () => {
         const hasAdminGroups =
            userData?.isAdmin || Object.keys(adminGroups || {}).length > 0
         setHasAdminGroups(hasAdminGroups)
         if (hasAdminGroups && (!type || type === "admin")) {
            addAdminTab()
            setValue("admin")
         }
      })()
   }, [adminGroups, type, userData?.isAdmin])

   useEffect(() => {
      ;(async () => {
         if (hasAdminGroups === undefined) return
         if (type === "admin") {
            setValue("admin")
         } else if (type === "joined") {
            setValue("joined")
         }
      })()
   }, [type, hasAdminGroups])

   useEffect(() => {
      if (hasAdminGroups) {
         addAdminTab()
      } else {
         setTabs(initialTabs)
      }
   }, [hasAdminGroups])
   const [filteredGroups, setFilteredGroups] = useState([])
   const [slicedFilteredGroups] = useInfiniteScrollClientWithHandlers(
      filteredGroups,
      9,
      6
   )

   useEffect(() => {
      ;(async () => {
         try {
            setLoading(true)
            if (value === "admin") {
               const groupsUserIsAnAdminOf = await groupRepo.getAdminGroups(
                  authenticatedUser.email,
                  Boolean(userData?.isAdmin)
               )
               setGroups(groupsUserIsAnAdminOf || [])
            } else if (value === "joined") {
               const groupDataIds = await groupRepo.getAllUserGroupDataIds(
                  authenticatedUser.email
               )
               const joinedGroups = await groupRepo.getGroupsByIds(groupDataIds)
               setGroups(joinedGroups)
            }
         } catch (e) {
            errorNotification(e.message)
         }
         setLoading(false)
      })()
   }, [
      value,
      userData?.groupIds,
      userData?.isAdmin,
      authenticatedUser.email,
      errorNotification,
   ])

   useEffect(() => {
      resetInput()
   }, [value])

   useEffect(() => {
      if (selectedGroup) {
         setFilteredGroups(
            groups.filter((group) => group.id === selectedGroup.id)
         )
      } else {
         setFilteredGroups([...groups])
      }
   }, [groups, selectedGroup])

   const resetInput = () => {
      handleSelectGroup(undefined, null)
   }
   const handleSelectGroup = (event, value) => {
      setSelectedGroup(value)
   }
   const handleChange = (
      event: React.SyntheticEvent,
      newValue: "joined" | "admin"
   ) => {
      setValue(newValue)
   }

   const addAdminTab = () => {
      setTabs([adminTab, ...initialTabs])
   }

   const existingGroupElements = useMemo(
      () =>
         slicedFilteredGroups.map((group) => (
            <CurrentGroup
               isAdmin={value === "admin"}
               key={group.id}
               group={group}
               userData={userData}
               // @ts-ignore
               hideMenu={!!isOnDialog}
            />
         )),
      [isOnDialog, slicedFilteredGroups, userData, value]
   )

   const showSearch = useMemo(
      () => userData?.isAdmin || Object.keys(adminGroups || {}).length > 6,
      [adminGroups, userData?.isAdmin]
   )

   return (
      <ContentCard>
         <div className={classes.header}>
            {isOnDialog ? null : (
               <Tabs
                  value={value || "joined"}
                  onChange={handleChange}
                  scrollButtons
                  allowScrollButtonsMobile
                  aria-label="group tabs"
               >
                  {tabs.map(({ label, ...tab }) => (
                     <Tab
                        key={label}
                        component={Link}
                        label={<ContentCardTitle>{label}</ContentCardTitle>}
                        shallow
                        {...tab}
                     />
                  ))}
               </Tabs>
            )}
         </div>
         {showSearch ? (
            <Box>
               <Highlights
                  handleSelectGroup={handleSelectGroup}
                  hideButton
                  key={value}
                  groups={groups}
               />
            </Box>
         ) : null}
         {loading ? (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
               <CircularProgress />
            </Box>
         ) : existingGroupElements.length ? (
            <Grid style={{ marginBottom: 50 }} container spacing={2}>
               {existingGroupElements}
            </Grid>
         ) : (
            <Fade in={!loading}>
               <Typography gutterBottom>
                  You are currently not{" "}
                  {value === "admin" ? "an admin" : "a member"} of any career
                  group.
               </Typography>
            </Fade>
         )}
      </ContentCard>
   )
}

interface HighlightProps {
   groups: (Group | UserAdminGroup)[]
   handleSelectGroup: (event: React.SyntheticEvent, value: Group) => void
   absolutePath?: string
   hideButton?: boolean
}
export const Highlights = ({
   groups,
   handleSelectGroup,
   absolutePath = undefined,
   hideButton,
}: HighlightProps) => {
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
            getOptionLabel={(option: Group) =>
               option.universityName ? option.universityName : ""
            }
            renderInput={(params) => (
               <TextField
                  {...params}
                  style={{ backgroundColor: "white", margin: 0 }}
                  placeholder="Join some groups"
                  label="Company name"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                     ...params.InputProps,
                     startAdornment: (
                        <InputAdornment position="start">
                           <FindIcon color={"black"} />
                        </InputAdornment>
                     ),
                  }}
               />
            )}
            renderOption={(props, option, { inputValue }) => {
               const matches = match(option.universityName, inputValue)
               const parts = parse(option.universityName, matches)
               const key = `listItem-${option.id}-${option.id}`
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

export default Groups
