import React, {useState} from 'react';
import clsx from 'clsx';
import moment from 'moment';
import {v4 as uuid} from 'uuid';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    CardHeader,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    Tooltip,
    makeStyles
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid} from '@material-ui/data-grid';
import {useDemoData} from '@material-ui/x-grid-data-generator';
import {withFirebase} from "../../../../../../context/firebase";

const useStyles = makeStyles(() => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    }
}));

const UsersTable = ({className, ...rest}) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    console.log("-> selection", selection);

    const {data} = useDemoData({
        dataSet: 'Commodity',
        rowLength: 20,
        maxColumns: 6,
    });

    const newData = {
        columns:[
            {
                field: "firstName",
                headerName: "First Name",
                width: 110,
            },
            {
                field: "lastName",
                headerName: "Last Name",
                width: 110,
            },
            {
                field: "email",
                headerName: "Email",
                width: 110,
            },
            {
                field: "streamsWatched",
                headerName: "Streams Watched",
                width: 110,
            },
        ],
        rows: data.rows
    }
    console.log("-> data", data);

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader title="Participating Students"/>
            <Divider/>
            <Box height={400} width="100%">
                <DataGrid
                    checkboxSelection
                    onSelectionChange={(newSelection) => {
                        setSelection(newSelection.rowIds);
                    }}
                    {...data}
                />
            </Box>
            <Box
                display="flex"
                justifyContent="flex-end"
                p={2}
            >
                <Button
                    color="primary"
                    endIcon={<ArrowRightIcon/>}
                    size="small"
                    variant="text"
                >
                    View all
                </Button>
            </Box>
        </Card>
    );
};

UsersTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(UsersTable);
