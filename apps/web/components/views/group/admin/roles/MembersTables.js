import React, { useCallback, useMemo, useState } from "react"
import clsx from "clsx"
import PropTypes from "prop-types"
import { Avatar, Badge, Box, Card, Typography } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import {
   defaultTableOptions,
   exportSelectionAction,
   tableIcons,
} from "../../../../util/tableUtils"
import { useSelector } from "react-redux"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { convertCamelToSentence } from "../../../../helperFunctions/HelperFunctions"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import ExportTable from "../../../common/Tables/ExportTable"
import { CSVDialogDownload } from "../../../../custom-hook/useMetaDataActions"
import { populate } from "react-redux-firebase"
import { groupAdminPopulates } from "../../../../custom-hook/useAdminGroup"

const customOptions = { ...defaultTableOptions }
customOptions.selection = false

const useStyles = makeStyles((theme) => ({
   root: {},
   actions: {
      justifyContent: "flex-end",
   },
   streamManage: {
      background: theme.palette.navyBlue.main,
      color: theme.palette.common.white,
   },
   userAvatar: {
      width: 60,
      height: 60,
      boxShadow: theme.shadows[1],
   },
   displayName: {
      marginLeft: theme.spacing(4),
   },
}))

const SelfBadge = ({ badgeContent, ...props }) => (
   <Badge
      badgeContent={
         badgeContent ? (
            <Typography style={{ fontSize: 8 }}>{badgeContent}</Typography>
         ) : (
            0
         )
      }
      anchorOrigin={{
         vertical: "bottom",
         horizontal: "right",
      }}
      color="primary"
      {...props}
   />
)

const AdminBadge = ({ badgeContent, ...props }) => (
   <Badge
      badgeContent={
         badgeContent ? (
            <Typography style={{ fontSize: 8 }}>{badgeContent}</Typography>
         ) : (
            0
         )
      }
      anchorOrigin={{
         vertical: "top",
         horizontal: "right",
      }}
      {...props}
   />
)

const MembersTable = ({
   openAddMemberModal,
   handleCloseAreYouSureModal,
   loading,
   handleClickKickButton,
   handleClickPromoteButton,
   handleConfirm,
   areYouSureModalOpen,
   areYouSureModalMessage,
   className,
   ...rest
}) => {
   const classes = useStyles()
   const [selection, setSelection] = useState([])
   const { authenticatedUser } = useAuth()
   const group = useSelector(({ firestore }) =>
      populate(firestore, "group", groupAdminPopulates)
   )
   const adminRoles = useSelector(({ firestore }) => firestore.data.adminRoles)
   const userRole = useSelector(
      ({ firestore }) => firestore.data.userRole || {}
   )

   const data = useMemo(() => {
      if (group.admins?.length) {
         return group.admins.map((userData) => {
            let newUserData = {
               ...userData,
               displayName: userData.firstName
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.id,
            }
            const userRole = adminRoles?.[userData.userEmail] || {}
            newUserData = { ...newUserData, ...userRole }
            return newUserData
         })
      }
      return []
   }, [group.admins])

   const getRoleLookup = () => {
      const roleOptions = {}

      data.forEach((admin) => {
         const { role } = admin
         if (role) {
            roleOptions[role] = convertCamelToSentence(role)
         }
      })
      return roleOptions
   }

   const columns = [
      {
         field: "displayName",
         title: "Admin",
         export: false,
         sorting: false,
         width: 150,
         render: (rowData) => (
            <Box display="flex" alignItems="center">
               <AdminBadge
                  color={rowData.role === "mainAdmin" ? "secondary" : "primary"}
                  badgeContent={convertCamelToSentence(rowData.role) || 0}
               >
                  <SelfBadge
                     badgeContent={
                        rowData.userEmail === authenticatedUser.email
                           ? "You"
                           : 0
                     }
                  >
                     <Avatar
                        className={classes.userAvatar}
                        src={rowData.avatarUrl}
                        alt={`${rowData.firstName}'s Avatar`}
                     >
                        {rowData.firstName
                           ? `${rowData.firstName[0] + rowData.lastName[0]}`
                           : ""}
                     </Avatar>
                  </SelfBadge>
               </AdminBadge>
               <Typography className={classes.displayName}>
                  {rowData.displayName}
               </Typography>
            </Box>
         ),
      },
      {
         field: "firstName",
         title: "First Name",
         hidden: true,
         export: true,
      },
      {
         field: "lastName",
         title: "Last Name",
         hidden: true,
         export: true,
      },
      {
         field: "role",
         title: "Role",
         lookup: getRoleLookup(),
      },
      {
         field: "userEmail",
         title: "Email",
         render: ({ userEmail }) => (
            <a href={`mailto:${userEmail}`}>{userEmail}</a>
         ),
      },
   ]

   const getTitle = () => `Admin Members of ${group.universityName}`

   const [csvDownloadData, setCsvDownloadData] = useState(null)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

   return (
      <>
         <Card className={clsx(classes.root, className)} {...rest}>
            <ExportTable
               icons={tableIcons}
               data={data}
               columns={columns}
               options={customOptions}
               actions={[
                  exportSelectionAction(
                     columns,
                     getTitle(),
                     setCsvDownloadData
                  ),
                  {
                     tooltip: "Invite a Member",
                     icon: tableIcons.ThemedAdd,
                     isFreeAction: true,
                     iconProps: { color: "primary" },
                     onClick: openAddMemberModal,
                  },
                  (rowData) => ({
                     icon: tableIcons.RemoveCircleOutlineIcon,
                     iconProps: { color: "primary" },
                     position: "row",
                     tooltip: "Kick from dashboard",
                     onClick: (event, rowData) =>
                        handleClickKickButton(rowData),
                     disabled:
                        rowData.role === "mainAdmin" ||
                        userRole.role !== "mainAdmin" ||
                        loading,
                     hidden:
                        rowData.role === "mainAdmin" ||
                        userRole.role !== "mainAdmin",
                  }),
                  (rowData) => ({
                     icon: tableIcons.SupervisorAccountIcon,
                     iconProps: { color: "primary" },
                     position: "row",
                     tooltip: "Make main Admin",
                     onClick: (event, rowData) =>
                        handleClickPromoteButton(rowData),
                     disabled:
                        rowData.role === "mainAdmin" ||
                        userRole.role !== "mainAdmin" ||
                        loading,
                     hidden:
                        rowData.role === "mainAdmin" ||
                        userRole.role !== "mainAdmin",
                  }),
               ]}
               onSelectionChange={(rows) => {
                  setSelection(rows)
               }}
               title={getTitle()}
            />
            <AreYouSureModal
               open={areYouSureModalOpen}
               handleClose={handleCloseAreYouSureModal}
               loading={loading}
               title="Are you sure?"
               handleConfirm={handleConfirm}
               message={areYouSureModalMessage}
            />
         </Card>
         <CSVDialogDownload
            title={csvDownloadData?.title}
            data={csvDownloadData?.data}
            filename={`${csvDownloadData?.filename}.csv`}
            defaultOpen={!!csvDownloadData}
            onClose={handleCloseCsvDialog}
         />
      </>
   )
}

MembersTable.propTypes = {
   areYouSureModalMessage: PropTypes.string,
   areYouSureModalOpen: PropTypes.bool,
   className: PropTypes.string,
   group: PropTypes.object,
   handleClickKickButton: PropTypes.func,
   handleClickPromoteButton: PropTypes.func,
   handleCloseAreYouSureModal: PropTypes.func,
   handleConfirm: PropTypes.func,
   loading: PropTypes.bool,
   openAddMemberModal: PropTypes.func,
}

export default MembersTable
