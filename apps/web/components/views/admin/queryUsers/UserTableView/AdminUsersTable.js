import React, { useCallback, useMemo, useState } from "react"
import { Card } from "@mui/material"
import {
   defaultTableOptions,
   exportSelectionAction,
   tableIcons,
} from "../../../../util/tableUtils"
import useUserTable from "../../../../custom-hook/useUserTable"
import { useSelector } from "react-redux"
import PropTypes from "prop-types"
import ExportTable from "../../../common/Tables/ExportTable"
import SendEmailTemplateDialog from "../SendEmailTemplateDialog/SendEmailTemplateDialog"

const customTableOptions = { ...defaultTableOptions }

const AdminUsersTable = ({ users, isFiltered }) => {
   const { setSelection, selection, handlers, columns, tableActions } =
      useUserTable()

   const [subscribedEmails, setSubscribedEmails] = useState([])
   const [emailTemplateDialogOpen, setEmailTemplateDialogOpen] = useState(false)

   const loading = useSelector((state) => state.currentFilterGroup.loading)

   const title = React.useMemo(
      () => `${isFiltered ? "Filtered" : "Total"} Users - ${users.length}`,
      [users.length, isFiltered]
   )

   const handleOpenEmailTemplateDialog = useCallback(
      () => setEmailTemplateDialogOpen(true),
      []
   )
   const handleCloseEmailTemplateDialog = () =>
      setEmailTemplateDialogOpen(false)

   const adminUsersTableActions = useMemo(
      (position) => ({
         copyEmails: (rowData) => ({
            tooltip:
               !(rowData.length === 0) &&
               `Send an email to ${subscribedEmails.length} subscribed user(s)`,
            position: position || "toolbarOnSelect",
            icon: tableIcons.EmailIcon,
            disabled: rowData.length === 0,
            onClick: handleOpenEmailTemplateDialog,
         }),
      }),
      [handleOpenEmailTemplateDialog, subscribedEmails.length]
   )

   return (
      <Card>
         <ExportTable
            icons={tableIcons}
            isLoading={loading}
            data={users}
            options={customTableOptions}
            columns={columns()}
            actions={[
               exportSelectionAction(columns(), title),
               tableActions.copyEmails,
               tableActions.copyLinkedIn,
               adminUsersTableActions.copyEmails,
            ]}
            onSelectionChange={(rows) => {
               setSelection(rows)
               setSubscribedEmails(
                  rows.reduce(
                     (acc, curr) =>
                        !curr.unsubscribed ? acc.concat(curr.id) : acc,
                     []
                  )
               )
            }}
            title={title}
         />
         <SendEmailTemplateDialog
            onClose={handleCloseEmailTemplateDialog}
            open={emailTemplateDialogOpen}
            emails={subscribedEmails}
         />
      </Card>
   )
}

AdminUsersTable.propTypes = {
   users: PropTypes.arrayOf(PropTypes.shape({})),
   isFiltered: PropTypes.bool,
}

AdminUsersTable.defaultProps = {
   loading: false,
   users: [],
}
export default AdminUsersTable
