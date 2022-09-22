import React, { useCallback, useMemo, useState } from "react"
import { Avatar, Badge, Box, Card, Typography } from "@mui/material"
import { defaultTableOptions, tableIcons } from "../../../../util/tableUtils"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { convertCamelToSentence } from "../../../../helperFunctions/HelperFunctions"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import { CSVDialogDownload } from "../../../../custom-hook/useMetaDataActions"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import {
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
} from "@careerfairy/shared-lib/dist/groups"
import useGroupAdmins from "../../../../custom-hook/useGroupAdmins"
import MaterialTable, { Column, MaterialTableProps } from "@material-table/core"
import { sxStyles } from "../../../../../types/commonTypes"

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

const MembersTable = ({
   openAddMemberModal,
   handleCloseAreYouSureModal,
   loading,
   handleClickKickButton,
   handleClickPromoteButton,
   handleConfirm,
   areYouSureModalOpen,
   areYouSureModalMessage,
}: Props) => {
   const { authenticatedUser, userData } = useAuth()
   const { group, role } = useGroup()
   const { data: admins } = useGroupAdmins(group.id)

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
         },
         {
            field: "userEmail",
            title: "Email",
            render: ({ id }) => <a href={`mailto:${id}`}>{id}</a>,
         },
      ],
      [authenticatedUser.email]
   )
   const getTitle = () => `Admin Members of ${group.universityName}`

   // @ts-ignore
   const actions = useMemo<MaterialTableProps<GroupAdmin>["actions"]>(
      () => [
         {
            tooltip: "Invite a Member",
            // @ts-ignore
            icon: tableIcons.ThemedAdd,
            isFreeAction: true,
            iconProps: { color: "primary" },
            onClick: openAddMemberModal,
         },
         {
            // @ts-ignore
            icon: tableIcons.RemoveCircleOutlineIcon,
            iconProps: { color: "primary" },
            position: "row",
            tooltip: "Kick from dashboard",
            onClick: (event, rowData) =>
               handleClickKickButton(rowData as GroupAdmin),
            disabled: loading,
            hidden: role === GROUP_DASHBOARD_ROLE.MEMBER && !userData.isAdmin,
         },
         {
            // @ts-ignore
            icon: tableIcons.SupervisorAccountIcon,
            iconProps: { color: "primary" },
            position: "row",
            tooltip: "Make main Admin",
            onClick: (event, rowData) =>
               handleClickPromoteButton(rowData as GroupAdmin),
            disabled: loading,
            hidden: role === GROUP_DASHBOARD_ROLE.MEMBER && !userData.isAdmin,
         },
      ],
      [
         loading,
         role,
         userData.isAdmin,
         openAddMemberModal,
         handleClickKickButton,
         handleClickPromoteButton,
      ]
   )

   const [csvDownloadData, setCsvDownloadData] = useState(null)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

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

type Props = {
   areYouSureModalMessage: string
   areYouSureModalOpen: boolean
   handleClickKickButton: (rowData: GroupAdmin) => void
   handleClickPromoteButton: (rowData: GroupAdmin) => void
   handleCloseAreYouSureModal: () => void
   handleConfirm: () => void
   loading: boolean
   openAddMemberModal: () => void
}

export default MembersTable
