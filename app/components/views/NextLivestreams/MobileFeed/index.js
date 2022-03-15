import React, { useEffect, useState } from "react"

import { Box, Button, Grid, Typography } from "@mui/material"
import { withFirebase } from "../../../../context/firebase/FirebaseServiceContext"
import GroupStreams from "../GroupStreams/GroupStreams"
import { useRouter } from "next/router"
import GroupJoinModal from "../../profile/GroupJoinModal"
import FiltersDrawer from "./FiltersDrawer"

const styles = {
   streamsGrid: {
      height: "100%",
   },
   followButton: {
      marginTop: "5px",
      position: "sticky",
      top: "165px",
      zIndex: 20,
   },
}

const MobileFeed = ({
   handleToggleActive,
   hasCategories,
   groupData,
   userData,
   alreadyJoined,
   livestreams,
   searching,
   scrollToTop,
   livestreamId,
   careerCenterId,
   listenToUpcoming,
   selectedOptions,
   isPastLivestreams,
}) => {
   const router = useRouter()
   const absolutePath = router.asPath
   const [value, setValue] = useState(0)
   const [openJoinModal, setOpenJoinModal] = useState(false)
   const { query } = useRouter()

   useEffect(() => {
      if (groupData) {
         handleResetView()
      }
   }, [groupData.universityName])

   useEffect(() => {
      if (Object.keys(query).length) {
         scrollToTop()
      }
   }, [value, query])

   const handleResetView = () => {
      setValue(0)
   }

   const handleCloseJoinModal = () => {
      setOpenJoinModal(false)
   }
   const handleOpenJoinModal = () => {
      setOpenJoinModal(true)
   }

   const handleJoin = () => {
      if (userData) {
         handleOpenJoinModal()
      } else {
         return router.push({ pathname: "/login", query: { absolutePath } })
      }
   }

   return (
      <Box p={2}>
         {!userData?.groupIds?.includes(groupData.groupId) &&
            !listenToUpcoming && (
               <>
                  <Button
                     sx={styles.followButton}
                     onClick={handleJoin}
                     size="large"
                     variant="contained"
                     fullWidth
                     color="primary"
                     align="center"
                  >
                     <Typography variant="h5">
                        Start Following {groupData.universityName}
                     </Typography>
                  </Button>
                  <GroupJoinModal
                     open={openJoinModal}
                     group={groupData}
                     alreadyJoined={alreadyJoined}
                     userData={userData}
                     closeModal={handleCloseJoinModal}
                  />
               </>
            )}
         <Grid sx={styles.streamsGrid} container spacing={2}>
            <GroupStreams
               mobile={true}
               livestreamId={livestreamId}
               listenToUpcoming={listenToUpcoming}
               careerCenterId={careerCenterId}
               isPastLivestreams={isPastLivestreams}
               selectedOptions={selectedOptions}
               searching={searching}
               livestreams={livestreams}
               groupData={groupData}
            />
         </Grid>
         <FiltersDrawer
            groupData={groupData}
            hasCategories={hasCategories}
            handleToggleActive={handleToggleActive}
         />
      </Box>
   )
}

export default withFirebase(MobileFeed)
