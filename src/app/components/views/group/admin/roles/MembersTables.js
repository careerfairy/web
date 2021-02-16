import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Card} from '@material-ui/core';
import MaterialTable from "material-table";
import {makeStyles} from "@material-ui/core/styles";
import {defaultTableOptions, tableIcons} from "../../../../util/tableUtils";

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

const columns = [
    {
        field: "avatar",
        title: "Avatar",
        width: 180,
        searchable: false,
        export: false

    },
    {
        field: "firstName",
        title: "First Name",
        width: 140,
    },
    {
        field: "lastName",
        title: "Last Name",
        width: 140,
    },
    {
        field: "role",
        title: "Role",
        width: 140,
    },
]
const MembersTable = ({
                          group,
                          className,
                          ...rest
                      }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {

    },[group])


    console.log("-> group", group);
    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <MaterialTable
                icons={tableIcons}
                data={[]}
                columns={columns}
                options={defaultTableOptions}

                onSelectionChange={(rows) => {
                    setSelection(rows);
                }}
                title={`Admin Members of ${group.universityName}`}
            />
        </Card>
    );
};

MembersTable.propTypes = {
    className: PropTypes.string
};

export default MembersTable
