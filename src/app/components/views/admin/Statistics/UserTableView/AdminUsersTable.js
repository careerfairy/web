import React from 'react';
import {Card} from "@material-ui/core";
import MaterialTable from "material-table";
import {defaultTableOptions, exportSelectionAction, LinkifyText, tableIcons} from "../../../../util/tableUtils";
import useUserTable from "../../../../custom-hook/useUserTable";
import {useSelector} from "react-redux";
import PropTypes from 'prop-types'

const customTableOptions = {...defaultTableOptions}
const columns = [
    {
        field: "firstName",
        title: "First Name",
    },
    {
        field: "lastName",
        title: "Last Name",
    },
    {
        field: "university.name",
        title: "University",
    },
    {
        field: "unsubscribed",
        title: "Has Unsubscribed From Newsletter",
        type: "boolean"
    },
    {
        field: "universityCountry",
        title: "University Country",
    },
    {
        field: "userEmail",
        title: "Email",
        render: ({id}) => (
            <a href={`mailto:${id}`}>
                {id}
            </a>
        ),
        cellStyle: {
            width: 300,
        },
    },
    {
        field: "linkedinUrl",
        title: "LinkedIn",
        render: (rowData) => LinkifyText(rowData.linkedinUrl),

    }
]
const AdminUsersTable = ({users}) => {

    const {setSelection, selection, handlers} = useUserTable()

    const loading = useSelector(state => state.currentFilterGroup.loading)


    return (
        <Card>
            <MaterialTable
                icons={tableIcons}
                isLoading={loading}
                data={users}
                options={customTableOptions}
                columns={[
                    {
                        field: "firstName",
                        title: "First Name",
                    },
                    {
                        field: "lastName",
                        title: "Last Name",
                    },
                    {
                        field: "university.name",
                        title: "University",
                    },
                    {
                        field: "unsubscribed",
                        title: "Has Unsubscribed From Newsletter",
                        type: "boolean"
                    },
                    {
                        field: "universityCountry",
                        title: "University Country",
                    },
                    {
                        field: "userEmail",
                        title: "Email",
                        render: ({id}) => (
                            <a href={`mailto:${id}`}>
                                {id}
                            </a>
                        ),
                        cellStyle: {
                            width: 300,
                        },
                    },
                    {
                        field: "linkedinUrl",
                        title: "LinkedIn",
                        render: (rowData) => LinkifyText(rowData.linkedinUrl),

                    }
                ]}
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
    )
};

AdminUsersTable.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({

    }))
}

AdminUsersTable.defaultProps = {
    loading: false
}
export default AdminUsersTable;

