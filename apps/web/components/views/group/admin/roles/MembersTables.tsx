import React, { useCallback, useMemo, useState } from "react"
import {
   Avatar,
   Badge,
   Box,
   Card,
   MenuItem,
   Tooltip,
   Typography,
} from "@mui/material"
import { defaultTableOptions, tableIcons } from "../../../../util/tableUtils"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { convertCamelToSentence } from "../../../../helperFunctions/HelperFunctions"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import {
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
} from "@careerfairy/shared-lib/dist/groups"
import useGroupAdmins from "../../../../custom-hook/useGroupAdmins"
import MaterialTable, { Column, MaterialTableProps } from "@material-table/core"
import { sxStyles } from "../../../../../types/commonTypes"
import TextField from "@mui/material/TextField"
import AddMemberModal from "./AddMemberModal"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"

const customOptions = { ...defaultTableOptions }
customOptions.selection = false

const styles = sxStyles({
   userAvatar: {
      width: 60,
      height: 60,
      boxShadow: 1,
   },
   displayName: {
      marginLeft: 4,
   },
})

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

type ChangeRoleDialogProps = {
   currentRole: GROUP_DASHBOARD_ROLE
   newRole: GROUP_DASHBOARD_ROLE
   displayName: string
   email: string
}
type KickMemberDialogProps = {
   displayName: string
   email: string
}
const MembersTable = () => {
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { changeRole, kickFromDashboard } = useFirebaseService()

   const { authenticatedUser, userData } = useAuth()

   const { group, role } = useGroup()

   const { data: admins } = useGroupAdmins(group.id)

   const [showAddMemberModal, setShowAddMemberModal] = useState(false)

   const [changingRole, setChangingRole] = useState(false)
   const [kickingMember, setKickingMember] = useState(false)

   const [changeRoleDialogData, setChangeRoleDialogData] =
      useState<ChangeRoleDialogProps>(null)

   const [kickAdminDialogData, setKickAdminDialogData] =
      useState<KickMemberDialogProps>(null)

   const openAddMemberModal = useCallback(() => {
      setShowAddMemberModal(true)
   }, [])

   const closeAddMemberModal = () => {
      setShowAddMemberModal(false)
   }

   const closeChangeRoleDialog = () => {
      setChangeRoleDialogData(null)
   }

   const closeKickMemberDialog = () => {
      setKickAdminDialogData(null)
   }

   const getTitle = () => `Admin Members of ${group.universityName}`
   const CFAdminNotice = userData?.isAdmin
      ? `(Only visible to CF Admins or ${GROUP_DASHBOARD_ROLE.OWNER})`
      : ""

   const handleChangeRole = async () => {
      try {
         setChangingRole(true)
         await changeRole({
            groupId: group.id,
            email: changeRoleDialogData.email,
            newRole: changeRoleDialogData.newRole,
         })
         successNotification("Role changed successfully")
         closeChangeRoleDialog()
      } catch (e) {
         errorNotification(e)
      }
      setChangingRole(false)
   }

   const handleKickMember = async () => {
      try {
         setKickingMember(true)
         await kickFromDashboard({
            groupId: group.id,
            email: kickAdminDialogData.email,
         })
         const isMe = kickAdminDialogData.email === authenticatedUser.email
         successNotification(
            isMe ? "Successfully left group" : "Member kicked successfully"
         )
         closeKickMemberDialog()
      } catch (e) {
         console.log("-> e", e.message)
         errorNotification(e)
      }
      setKickingMember(false)
   }

   // @ts-ignore
   const actions = useMemo<MaterialTableProps<GroupAdmin>["actions"]>(
      () => [
         {
            tooltip: `Invite a Member ${CFAdminNotice}`,
            // @ts-ignore
            icon: tableIcons.ThemedAdd,
            isFreeAction: true,
            iconProps: { color: "primary" },
            onClick: openAddMemberModal,
            hidden: role === GROUP_DASHBOARD_ROLE.MEMBER && !userData?.isAdmin,
         },
         // @ts-ignore
         (rowData) => ({
            // @ts-ignore
            icon: tableIcons.RemoveCircleOutlineIcon,
            iconProps: { color: "primary" },
            position: "row",
            tooltip:
               rowData.email === authenticatedUser.email
                  ? "Leave group"
                  : `Kick from dashboard ${CFAdminNotice}`,
            onClick: (event, rowData: GroupAdmin) =>
               setKickAdminDialogData({
                  displayName: rowData.displayName,
                  email: rowData.id,
               }),
            disabled: kickingMember,
            hidden: role === GROUP_DASHBOARD_ROLE.MEMBER && !userData?.isAdmin,
         }),
      ],
      [
         CFAdminNotice,
         kickingMember,
         openAddMemberModal,
         role,
         userData?.isAdmin,
      ]
   )

   const columns = useMemo<Column<GroupAdmin>[]>(
      () => [
         {
            field: "displayName",
            title: "Admin",
            export: false,
            sorting: false,
            width: 150,
            render: (rowData) => (
               <Box display="flex" alignItems="center">
                  <AdminBadge
                     color={
                        rowData.role === GROUP_DASHBOARD_ROLE.OWNER
                           ? "secondary"
                           : "primary"
                     }
                     badgeContent={convertCamelToSentence(rowData.role) || 0}
                  >
                     <SelfBadge
                        badgeContent={
                           rowData.id === authenticatedUser.email ? "You" : 0
                        }
                     >
                        <Avatar
                           sx={styles.userAvatar}
                           alt={`${rowData.firstName}'s Avatar`}
                        >
                           {rowData.firstName
                              ? `${rowData.firstName[0] + rowData.lastName[0]}`
                              : ""}
                        </Avatar>
                     </SelfBadge>
                  </AdminBadge>
                  <Typography sx={styles.displayName}>
                     {[rowData.firstName, rowData.lastName]
                        .filter((name) => name)
                        .join(" ")}
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
            lookup: GROUP_DASHBOARD_ROLE,
            render: (rowData) => {
               const hasNoAccess =
                  role !== GROUP_DASHBOARD_ROLE.OWNER && !userData?.isAdmin
               const disabled =
                  hasNoAccess ||
                  changingRole ||
                  rowData.email === authenticatedUser.email
               return (
                  <Tooltip title={hasNoAccess ? "You don't have access" : ""}>
                     <TextField
                        id="role-select"
                        select={!disabled}
                        fullWidth
                        disabled={disabled}
                        inputProps={{
                           readOnly: disabled,
                        }}
                        label={disabled ? "" : "Change role"}
                        value={rowData.role || GROUP_DASHBOARD_ROLE.MEMBER}
                        name="role"
                        onChange={(e) => {
                           setChangeRoleDialogData({
                              currentRole: rowData.role,
                              newRole: e.target.value as GROUP_DASHBOARD_ROLE,
                              displayName: rowData.displayName,
                              email: rowData.id,
                           })
                        }}
                        helperText={disabled ? "" : "Select a role"}
                     >
                        {Object.values(GROUP_DASHBOARD_ROLE).map(
                           (role: string) => (
                              <MenuItem key={role} value={role}>
                                 {role}
                              </MenuItem>
                           )
                        )}
                     </TextField>
                  </Tooltip>
               )
            },
         },
         {
            field: "userEmail",
            title: "Email",
            render: ({ id }) => <a href={`mailto:${id}`}>{id}</a>,
         },
      ],
      [authenticatedUser.email, changingRole, role, userData?.isAdmin]
   )

   return (
      <>
         <Card>
            <MaterialTable
               icons={tableIcons}
               data={admins}
               columns={columns}
               options={customOptions}
               actions={actions}
               title={getTitle()}
            />
            {kickAdminDialogData && (
               <AreYouSureModal
                  open={Boolean(kickAdminDialogData)}
                  handleClose={closeKickMemberDialog}
                  loading={kickingMember}
                  message={
                     kickAdminDialogData.email === authenticatedUser.email
                        ? `You are about to leave ${group.universityName}. In order to regain access at a later time, a Group Owner must invite you.`
                        : `Are you sure you want to kick ${kickAdminDialogData.displayName}?`
                  }
                  handleConfirm={handleKickMember}
               />
            )}
            {changeRoleDialogData && (
               <AreYouSureModal
                  open={Boolean(changeRoleDialogData)}
                  handleClose={closeChangeRoleDialog}
                  loading={changingRole}
                  title={`Are you sure you want to change the ${changeRoleDialogData.currentRole} role of ${changeRoleDialogData.displayName}'s to ${changeRoleDialogData.newRole}?`}
                  handleConfirm={handleChangeRole}
                  message={
                     changeRoleDialogData.newRole === GROUP_DASHBOARD_ROLE.OWNER
                        ? "This user will have full access to the dashboard and will be able to invite other admins."
                        : "This user will have limited access to your dashboard."
                  }
               />
            )}
         </Card>
         <AddMemberModal
            group={group}
            open={showAddMemberModal}
            onClose={closeAddMemberModal}
         />
      </>
   )
}

export default MembersTable
