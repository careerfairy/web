import React from 'react';
import {Card} from "@material-ui/core";
import MaterialTable from "material-table";
import {defaultTableOptions, exportSelectionAction, tableIcons} from "../../../../util/tableUtils";
import useUserTable from "../../../../custom-hook/useUserTable";
import {useSelector} from "react-redux";
import PropTypes from 'prop-types'

const customTableOptions = {...defaultTableOptions}

const AdminUsersTable = ({users = []}) => {

    const {setSelection, selection, handlers, columns, tableActions} = useUserTable()

    const loading = useSelector(state => state.currentFilterGroup.loading)

    return (
        <Card>
            <MaterialTable
                icons={tableIcons}
                isLoading={loading}
                data={users}
                options={customTableOptions}
                columns={columns()}
                actions={[
                    exportSelectionAction(columns(), `Users - ${users.length}`),
                    tableActions.copyEmails,
                    tableActions.copyLinkedIn
                ]}
                onSelectionChange={(rows) => {
                    setSelection(rows);
                }}
                title={`Users - ${users.length}`}
            />
        </Card>
    )
};

AdminUsersTable.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({}))
}

AdminUsersTable.defaultProps = {
    loading: false
}
export default AdminUsersTable;

