import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Avatar, Card} from '@material-ui/core';
import MaterialTable from "material-table";
import {makeStyles} from "@material-ui/core/styles";
import {defaultTableOptions, tableIcons} from "../../../../util/tableUtils";
import {useSelector} from "react-redux";
import {exportSelectionAction} from "../analytics/common/TableUtils";

const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    avatar: {
        height: 70,
        width: '80%',
        "& img": {
            objectFit: "contain"
        },
        boxShadow: theme.shadows[1]
    },
    streamManage: {
        background: theme.palette.navyBlue.main,
        color: theme.palette.common.white
    }
}));


const MembersTable = ({
                          group,
                          openAddMemberModal,
                          className,
                          ...rest
                      }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [data, setData] = useState([]);
    const roles = useSelector(({firestore}) => firestore.data.roles || {})
    console.log("-> roles", roles);


    useEffect(() => {
        const data = group?.admins.map(admin => {
            return {
                ...admin,
                role: roles[admin.id]?.role
            }
        })
        setData(data)
    }, [group])

    const getRoleLookup = () => {
        const roleOptions = {};
        const convertCamelToSentence = (string) => {
            return string.replace( /([A-Z])/g, " $1" )
                .charAt(0).toUpperCase()
                +
                string.replace( /([A-Z])/g, " $1" )
                    .slice(1)
        }
        data.forEach(admin => {
            const {role} = admin;
            if (role) {
                roleOptions[role] = convertCamelToSentence(role)
            }
        })
        return roleOptions
    }

    const columns = [
        {
            field: "avatarUrl",
            title: "Avatar",
            searchable: false,
            export: false,
            sorting: false,
            filtering: false,
            render: rowData => <Avatar src={rowData.avatarUrl} alt={`${rowData.firstName}'s Avatar`}>
                {`${rowData.firstName[0] + rowData.lastName[0]}`}
            </Avatar>

        },
        {
            field: "firstName",
            title: "First Name",
        },
        {
            field: "lastName",
            title: "Last Name",
        },
        {
            field: "role",
            title: "Role",
            lookup: getRoleLookup(),
        },
    ]

    const getTitle = () => `Admin Members of ${group.universityName}`

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <MaterialTable
                icons={tableIcons}
                data={data}
                columns={columns}
                options={defaultTableOptions}
                actions={[
                    exportSelectionAction(columns, getTitle()),
                    {
                        tooltip: "Invite a Member",
                        icon: tableIcons.ThemedAdd,
                        isFreeAction: true,
                        iconProps: {color: "primary"},
                        onClick: openAddMemberModal
                    },
                ]}
                onSelectionChange={(rows) => {
                    setSelection(rows);
                }}
                title={getTitle()}
            />
        </Card>
    );
};

MembersTable.propTypes = {
    className: PropTypes.string
};

export default MembersTable
