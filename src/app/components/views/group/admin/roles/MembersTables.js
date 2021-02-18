import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Avatar, Badge, Card} from '@material-ui/core';
import MaterialTable from "material-table";
import {makeStyles} from "@material-ui/core/styles";
import {defaultTableOptions, tableIcons} from "../../../../util/tableUtils";
import {useSelector} from "react-redux";
import {exportSelectionAction} from "../analytics/common/TableUtils";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import {convertCamelToSentence} from "../../../../helperFunctions/HelperFunctions";


const customOptions = {...defaultTableOptions}
customOptions.selection = false

const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    streamManage: {
        background: theme.palette.navyBlue.main,
        color: theme.palette.common.white
    },
    userAvatar: {
        width: 80,
        height: 80,
        boxShadow: theme.shadows[1]
    }
}));


const SelfBadge = ({...props}) =>
    <Badge
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }} color="primary" {...props}
    />
const AdminBadge = ({...props}) =>
    <Badge
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }} {...props}
    />

const MembersTable = ({
                          group,
                          openAddMemberModal,
                          handleKickAdmin,
                          kicking,
                          className,
                          ...rest
                      }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const firestore = useSelector(({firestore}) => firestore)
    const [data, setData] = useState([]);
    const {authenticatedUser} = useAuth()
    const adminRoles = useSelector(({firestore}) => firestore.data.adminRoles)
    const userRole = useSelector(({firestore}) => firestore.data.userRole || {})

    useEffect(() => {
        if (group.admins?.length) {
            const newData = group?.admins?.map(userData => {
                let newUserData = {...userData}
                const userRole = adminRoles?.[userData.userEmail]
                if (userRole) {
                    newUserData = {...newUserData, ...userRole}
                }
                return newUserData
            })
            setData(newData)
        }
    }, [group.admins])


    const getRoleLookup = () => {
        const roleOptions = {};

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
            width: 150,
            render: rowData =>
                <AdminBadge color={rowData.role === "mainAdmin" ? "secondary" : "primary"}
                            badgeContent={convertCamelToSentence(rowData.role) || 0}>
                    <SelfBadge badgeContent={rowData.userEmail === authenticatedUser.email ? "Me" : 0}>
                        <Avatar className={classes.userAvatar} src={rowData.avatarUrl}
                                alt={`${rowData.firstName}'s Avatar`}>
                            {rowData.firstName ? `${rowData.firstName[0] + rowData.lastName[0]}` : ""}
                        </Avatar>
                    </SelfBadge>
                </AdminBadge>
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
        {
            field: "userEmail",
            title: "Email",
            render: ({userEmail}) => (
                <a href={`mailto:${userEmail}`}>
                    {userEmail}
                </a>
            )
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
                options={customOptions}
                actions={[
                    exportSelectionAction(columns, getTitle()),
                    {
                        tooltip: "Invite a Member",
                        icon: tableIcons.ThemedAdd,
                        isFreeAction: true,
                        iconProps: {color: "primary"},
                        onClick: openAddMemberModal
                    },
                    (rowData) => ({
                        icon: tableIcons.RemoveCircleOutlineIcon,
                        iconProps: {color: "primary"},
                        position: "row",
                        tooltip: 'Kick from dashboard',
                        onClick: (event, rowData) => handleKickAdmin(rowData),
                        disabled: rowData.role === "mainAdmin" || userRole.role !== "mainAdmin" || kicking,
                        hidden: rowData.role === "mainAdmin" || userRole.role !== "mainAdmin",
                    })
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
