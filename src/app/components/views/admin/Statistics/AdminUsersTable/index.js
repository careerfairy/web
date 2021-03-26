import React from 'react';
import {Card} from "@material-ui/core";
import MaterialTable from "material-table";
import {defaultTableOptions, exportSelectionAction, tableIcons} from "../../../../util/tableUtils";
import useUserTable from "../../../../custom-hook/useUserTable";
import {useSelector} from "react-redux";
import {isLoaded} from "react-redux-firebase";

const customTableOptions = {...defaultTableOptions}
const AdminUsersTable = () => {

    const {setSelection, selection, handlers, columns} = useUserTable()
    const users = useSelector(state => state.currentFilterGroup.totalStudentsData.ordered)
    const loading = useSelector(state => state.currentFilterGroup.loading)

    return isLoaded(users) ? (
        <Card>
            <MaterialTable
                icons={tableIcons}
                isLoading={loading}
                data={users}
                options={customTableOptions}
                columns={columns}
                actions={[
                    exportSelectionAction(columns, `Users - ${users.length}`),
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
                title={`Users - ${users.length}`}
            />
        </Card>
    ) : null;
};

AdminUsersTable.propTypes = {
}

AdminUsersTable.defaultProps = {
    loading: false
}
export default AdminUsersTable;

