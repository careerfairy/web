import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Card} from "@material-ui/core";
import MaterialTable from "material-table";
import {defaultTableOptions, exportSelectionAction, tableIcons} from "../../../util/tableUtils";
import useUserTable from "../../../custom-hook/useUserTable";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({}));

const AdminUsersTable = ({users, loading}) => {

    const classes = useStyles()
    console.log("-> users", users);
    const {setSelection, selection, handlers,columns} = useUserTable()

    return (
        <Card>
            <MaterialTable
                icons={tableIcons}
                isLoading={loading}
                data={users}
                options={defaultTableOptions}
                columns={columns}
                actions={[
                    exportSelectionAction(columns, "Users"),
                    (rowData) => ({
                        tooltip: !(rowData.length === 0
                        ) && "Copy Emails",
                        position: "toolbarOnSelect",
                        icon: tableIcons.EmailIcon,
                        disabled: (rowData.length === 0
                        ),
                        onClick: handlers.handleCopyEmails
                    }),
                    (rowData) => ({
                        tooltip: !(rowData.length === 0
                        ) && "Copy LinkedIn Addresses",
                        position: "toolbarOnSelect",
                        icon: tableIcons.LinkedInIcon,
                        disabled: (rowData.length === 0
                        ),
                        onClick: handlers.handleCopyLinkedin
                    }),
                ]}
                onSelectionChange={(rows) => {
                    setSelection(rows);
                }}
                title="Users"
            />
        </Card>
    );
};

AdminUsersTable.propTypes = {
  loading: PropTypes.bool,
  users: PropTypes.arrayOf(PropTypes.shape({
      userEmail: PropTypes.string,
  })).isRequired
}

AdminUsersTable.defaultProps = {
  loading: false
}
export default AdminUsersTable;

