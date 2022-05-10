import React, { useEffect, useState } from "react"
import {
   Box,
   CircularProgress,
   Fade,
   Grid,
   Tab,
   Tabs,
   Typography,
} from "@mui/material"
import { useRouter } from "next/router"
import CurrentGroup from "components/views/profile/CurrentGroup"
import makeStyles from "@mui/styles/makeStyles"
import { Highlights } from "../../groups/Groups"
import useInfiniteScrollClientWithHandlers from "../../../custom-hook/useInfiniteScrollClientWithHandlers"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import { useAuth } from "../../../../HOCs/AuthProvider"
import groupRepo from "../../../../data/firebase/GroupRepository"
import Link from "../../common/Link"
import { useDispatch } from "react-redux"
import * as actions from "../../../../store/actions"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"

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
      href: "/groups?type=joined",
   },
]

const adminTab = {
   label: "Groups you manage",
   value: "admin",
   href: "/groups?type=admin",
}
const Groups = () => {
   const classes = useStyles()
   const { userData, authenticatedUser } = useAuth()

   const {
      query: { type },
   } = useRouter()
   const dispatch = useDispatch()
   const [loading, setLoading] = useState(false)
   const [groups, setGroups] = useState([])
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
            userData?.isAdmin ||
            (await groupRepo.checkIfUserHasAdminGroups(authenticatedUser.email))
         setHasAdminGroups(hasAdminGroups)
         if (hasAdminGroups && (!type || type === "admin")) {
            addAdminTab()
            setValue("admin")
         }
      })()
   }, [])

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
               const adminGroups = await groupRepo.getAdminGroups(
                  authenticatedUser.email,
                  Boolean(userData?.isAdmin)
               )
               setGroups(adminGroups)
            } else if (value === "joined") {
               const joinedGroups = await groupRepo.getGroupsByIds(
                  userData?.groupIds || []
               )
               setGroups(joinedGroups)
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
         setLoading(false)
      })()
   }, [value, userData?.groupIds, userData?.isAdmin])

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
   // @ts-ignore
   const existingGroupElements = slicedFilteredGroups.map((group) => (
      <CurrentGroup
         isAdmin={value === "admin"}
         key={group.id}
         group={group}
         userData={userData}
      />
   ))

   return (
      <ContentCard>
         <div className={classes.header}>
            <Tabs
               value={value || "joined"}
               onChange={handleChange}
               scrollButtons
               allowScrollButtonsMobile
               aria-label="group tabs"
            >
               {tabs.map(({ label, ...tab }) => (
                  <Tab
                     component={Link}
                     label={<ContentCardTitle>{label}</ContentCardTitle>}
                     shallow
                     {...tab}
                  />
               ))}
            </Tabs>
         </div>
         <Box>
            <Highlights
               handleSelectGroup={handleSelectGroup}
               hideButton
               key={value}
               groups={groups}
            />
         </Box>
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

export default Groups
