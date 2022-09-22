import React, { useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Container, Grid } from "@mui/material"
import MembersTable from "./MembersTables"
import { useSelector } from "react-redux"
import AddMemberModal from "./AddMemberModal"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR, PERMISSION_ERROR } from "../../../../util/constants"
import { withFirebase } from "../../../../../context/firebase/FirebaseServiceContext"

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.background.dark,
      minHeight: "100%",
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
   },
}))

const RolesOverview = ({ firebase, group }) => {
   const { enqueueSnackbar } = useSnackbar()
   const classes = useStyles()
   const [kicking, setKicking] = useState(false)
   const [promoting, setPromoting] = useState(false)
   const [modalContext, setModalContext] = useState("")
   const [selectedRowData, setSelectedRowData] = useState({})
   const userRole = useSelector(
      ({ firestore }) => firestore.data.userRole || {}
   )

   const [showAddMemberModal, setShowAddMemberModal] = useState(false)
   const openAddMemberModal = () => {
      setShowAddMemberModal(true)
   }
   const closeAddMemberModal = () => {
      setShowAddMemberModal(false)
   }

   const handleCloseAreYouSureModal = () => {
      setModalContext("")
      setSelectedRowData({})
   }

   const handleClickKickButton = (rowData) => {
      setModalContext("kick")
      setSelectedRowData(rowData)
   }
   const handleClickPromoteButton = (rowData) => {
      setModalContext("promote")
      setSelectedRowData(rowData)
   }

   const handleConfirm = () => {
      if (modalContext === "kick") {
         return handleKickAdmin(selectedRowData)
      }
      if (modalContext === "promote") {
         return handleMakeAdmin(selectedRowData)
      }
   }

   const getAreYouSureModalOpen = () =>
      (modalContext === "kick" || modalContext === "promote") &&
      Boolean(selectedRowData.id)

   const getAreYouSureModalMessage = () =>
      modalContext === "kick"
         ? `Are you sure you want to kick ${selectedRowData.displayName}?`
         : modalContext === "promote"
         ? `Are you sure you want to promote ${selectedRowData.displayName} to main admin? You will no longer have the main admin title`
         : ""

   const handleKickAdmin = async (adminRole) => {
      try {
         if (adminRole === "mainAdmin" || userRole.role !== "mainAdmin") {
            enqueueSnackbar(
               "You cannot kick a head admin or you do not have permission",
               {
                  variant: "warning",
                  preventDuplicate: true,
               }
            )
         } else {
            setKicking(true)
            await firebase.kickFromDashboard(group.id, adminRole.id)
            enqueueSnackbar(
               `${adminRole.id} has been successfully kicked from the dashboard`,
               {
                  variant: "info",
                  preventDuplicate: true,
               }
            )
         }
      } catch (e) {
         console.error("-> error", e)
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
      }
      handleCloseAreYouSureModal()
      setKicking(false)
   }

   const handleMakeAdmin = async (adminRole) => {
      try {
         if (userRole.role !== "mainAdmin") {
            enqueueSnackbar(PERMISSION_ERROR, {
               variant: "error",
               preventDuplicate: true,
            })
         } else {
            setPromoting(true)
            await firebase.promoteToMainAdmin(group.id, adminRole.id)
            enqueueSnackbar(
               `${adminRole.id} has been successfully promoted to mainAdmin`,
               {
                  variant: "info",
                  preventDuplicate: true,
               }
            )
         }
      } catch (e) {
         console.error("-> error", e)
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
      }
      handleCloseAreYouSureModal()
      setPromoting(false)
   }

   return (
      <Container className={classes.root} maxWidth="lg">
         <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
               <MembersTable
                  areYouSureModalOpen={getAreYouSureModalOpen()}
                  handleCloseAreYouSureModal={handleCloseAreYouSureModal}
                  handleClickKickButton={handleClickKickButton}
                  handleClickPromoteButton={handleClickPromoteButton}
                  handleConfirm={handleConfirm}
                  areYouSureModalMessage={getAreYouSureModalMessage()}
                  loading={kicking || promoting}
                  openAddMemberModal={openAddMemberModal}
               />
            </Grid>
         </Grid>
         <AddMemberModal
            group={group}
            open={showAddMemberModal}
            onClose={closeAddMemberModal}
         />
      </Container>
   )
}

export default withFirebase(RolesOverview)
