import React, { Fragment, useContext, useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import UserCategorySelector from "components/views/profile/UserCategorySelector"
import {
   Box,
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Typography,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import StatsUtil from "../../../../../data/util/StatsUtil"
import LogoButtons from "../../../NextLivestreams/GroupStreams/LogoButtons"
import { RegistrationContext } from "context/registration/RegistrationContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import GroupLogo from "../common/GroupLogo"

const useStyles = makeStyles((theme) => ({
   actions: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
   },
   loaderWrapper: {
      height: 200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
}))

const CategorySelect = () => {
   const {
      group,
      groups,
      groupsWithPolicies,
      livestream,
      alreadyJoined,
      completeRegistrationProcess,
      handleClose,
      gettingPolicyStatus,
      hasAgreedToAll,
      onGroupJoin,
      cancelable,
   } = useContext(RegistrationContext)
   const { userData } = useAuth()
   const classes = useStyles()
   const firebase = useFirebaseService()
   const [checkingCategories, setCheckingCategories] = useState(false)
   const [categories, setCategories] = useState([])
   const [allSelected, setAllSelected] = useState(false)
   const [submitting, setSubmitting] = useState(false)
   const [localGroupsWithPolicies, setLocalGroupsWithPolicies] = useState([])

   useEffect(() => {
      setLocalGroupsWithPolicies(groupsWithPolicies || [])
   }, [groupsWithPolicies])
   useEffect(() => {
      if (group.categories?.length) {
         ;(async function () {
            setCheckingCategories(true)
            try {
               const newCategories = StatsUtil.mapUserCategorySelection({
                  userData,
                  group,
                  alreadyJoined,
               })
               const hasAlreadySelectedAllCategories = newCategories.every(
                  (cat) => cat.isNew === false
               )
               if (hasAlreadySelectedAllCategories && hasAgreedToAll) {
                  await completeRegistrationProcess()
               } else {
                  setCategories(newCategories)
               }
            } catch (e) {}
            setCheckingCategories(false)
         })()
      }
   }, [group, userData.id, hasAgreedToAll])

   useEffect(() => {
      if (categories) {
         const notAllSelected = !categories.some(
            (category) => category.selectedValueId === ""
         )
         setAllSelected(notAllSelected)
      }
   }, [categories])

   const handleSetSelected = (categoryId, event) => {
      setCategories((prevState) =>
         prevState.map((category) =>
            category.id === categoryId
               ? { ...category, selectedValueId: event.target.value }
               : category
         )
      )
   }

   const handleJoinGroup = async () => {
      try {
         setSubmitting(true)
         const newCategories = categories.map((categoryObj) => {
            return {
               id: categoryObj.id,
               selectedValueId: categoryObj.selectedValueId,
            }
         })
         const groupObj = {
            groupId: group.id,
            categories: newCategories,
         }
         let arrayOfGroupObjects = userData.registeredGroups?.length
            ? userData.registeredGroups?.filter(
                 (group) => group.groupId !== groupObj.groupId
              )
            : []

         arrayOfGroupObjects.push(groupObj)

         let arrayOfGroupIds = arrayOfGroupObjects.map((obj) => obj.groupId)

         if (userData.groupIds?.length) {
            arrayOfGroupIds = [...arrayOfGroupIds, ...userData.groupIds]
         }

         const userId = userData.id || userData.userEmail
         await firebase.setgroups(
            userId,
            [...new Set(arrayOfGroupIds)],
            arrayOfGroupObjects
         )
         if (livestream) {
            await completeRegistrationProcess()
         } else {
            handleClose()
         }
      } catch (e) {
         console.log("error in handle join", e)
      }
      onGroupJoin?.()
      setSubmitting(false)
   }

   const renderCategories = categories.map((category, index) => {
      return (
         <Fragment key={category.id}>
            <UserCategorySelector
               handleSetSelected={handleSetSelected}
               index={index}
               isNew={!category.selectedValueId}
               alreadyJoined={alreadyJoined}
               category={category}
            />
         </Fragment>
      )
   })

   if (checkingCategories || gettingPolicyStatus) {
      return (
         <div className={classes.loaderWrapper}>
            <CircularProgress />
         </div>
      )
   }

   return (
      <>
         {!group.universityName ? (
            <>
               <DialogTitle align="center">
                  {livestream?.hasStarted
                     ? "Where are you joining from?"
                     : "Please follow one of the following groups in order to register:"}
               </DialogTitle>
               {groups?.length && <LogoButtons />}
            </>
         ) : (
            <>
               <DialogTitle align="center">
                  {livestream?.hasStarted && group?.universityName
                     ? `${group.universityName} Would Like To Know More About You`
                     : "Join live streams from"}
               </DialogTitle>
               <GroupLogo logoUrl={livestream?.companyLogoUrl} />
               <DialogContent>
                  <DialogContentText align="center" noWrap>
                     {group.description}
                  </DialogContentText>
                  <Box p={2} className={classes.actions}>
                     {!!categories.length && renderCategories}
                  </Box>
                  <Box p={2} className={classes.actions}>
                     {localGroupsWithPolicies.map((group) => (
                        <Typography
                           key={group.id}
                           style={{ fontSize: "0.8rem" }}
                        >
                           Your participant information (surname, first name,
                           university affiliation) and the data above will be
                           transferred to the organizer when you register for
                           the event. The data protection notice of the
                           organizer applies. You can find it
                           <a
                              target="_blank"
                              style={{ marginLeft: 4 }}
                              href={group.privacyPolicyUrl}
                           >
                              here
                           </a>
                           .
                        </Typography>
                     ))}
                  </Box>
               </DialogContent>
               <DialogActions>
                  {!livestream?.hasStarted && cancelable && (
                     <Button size="large" color="grey" onClick={handleClose}>
                        Cancel
                     </Button>
                  )}
                  {((alreadyJoined && group.categories) || !alreadyJoined) && (
                     <Button
                        disabled={!allSelected || submitting}
                        variant="contained"
                        size="large"
                        endIcon={
                           submitting && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        onClick={handleJoinGroup}
                        color="primary"
                        autoFocus
                     >
                        {!livestream
                           ? "Join group"
                           : livestream?.hasStarted
                           ? "Enter event"
                           : "I'll attend"}
                     </Button>
                  )}
               </DialogActions>
            </>
         )}
      </>
   )
}

export default CategorySelect
