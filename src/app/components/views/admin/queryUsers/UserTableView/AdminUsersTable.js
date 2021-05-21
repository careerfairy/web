import React from 'react';
import {Card} from "@material-ui/core";
import MaterialTable from "material-table";
import {defaultTableOptions, exportSelectionAction, tableIcons} from "../../../../util/tableUtils";
import useUserTable from "../../../../custom-hook/useUserTable";
import {useSelector} from "react-redux";
import PropTypes from 'prop-types'

const customTableOptions = {...defaultTableOptions}

const AdminUsersTable = ({users, isFiltered}) => {

    const {setSelection, selection, handlers, columns, tableActions} = useUserTable()

    const loading = useSelector(state => state.currentFilterGroup.loading)

    const title = React.useMemo(() => `${isFiltered ? "Filtered" : "Total"} Users - ${users.length}`, [users.length, isFiltered])

    return (
        <Card>
            <MaterialTable
                icons={tableIcons}
                isLoading={loading}
                data={users}
                options={customTableOptions}
                columns={columns()}
                actions={[
                    exportSelectionAction(columns(), title),
                    tableActions.copyEmails,
                    tableActions.copyLinkedIn
                ]}
                onSelectionChange={(rows) => {
                    setSelection(rows);
                }}
                title={title}
            />
        </Card>
    )
};

AdminUsersTable.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({})),
    isFiltered: PropTypes.bool
}

AdminUsersTable.defaultProps = {
    loading: false,
    users: [],
}
export default AdminUsersTable;

