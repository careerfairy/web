import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid} from '@material-ui/data-grid';
import {useDemoData} from '@material-ui/x-grid-data-generator';
import {withFirebase} from "../../../../../../context/firebase";
import {prettyDate} from "../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles(() => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    }
}));

const initialColumns = [
    {
        field: "id",
        headerName: "ID",
        width: 170,
        hide: true
    },
    {
        field: "firstName",
        headerName: "First Name",
        width: 170,
    },
    {
        field: "lastName",
        headerName: "Last Name",
        width: 170,
    },
    {
        field: "userEmail",
        headerName: "Email",
        width: 170,
    },
    {
        field: "gender",
        headerName: "Gender",
        width: 170,
    },
    {
        field: "streamsWatched",
        headerName: "Streams Watched",
        width: 170,
    },
]

const UsersTable = ({currentStream, group, totalUniqueUsers, className, ...rest}) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [columns, setColumns] = useState([]);
    const [expandTable, setExpandTable] = useState(false);

    useEffect(() => {
        const categoryColumns = getGroupCategoryColumns()
        setColumns([...initialColumns, ...categoryColumns])
    }, [group.id])
    const {data} = useDemoData({
        dataSet: 'Commodity',
        rowLength: 12,
        maxColumns: 6,
    });
    console.log("-> data", data);

    const getGroupCategoryColumns = () => {
        if (group.categories?.length) {
            return group.categories.map(category => {
                return {
                    field: category.name,
                    headerName: category.name,
                    width: 170
                }
            })
        } else {
            return []
        }
    }

    const toggleTable = () => {
        setExpandTable(!expandTable)
    }


    const newData = {
        columns: columns,
        rows: totalUniqueUsers
    }

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title="Participating Students"
                subheader={currentStream && `That attended ${currentStream.company} on ${prettyDate(currentStream.start)}`}
            />
            <Divider/>
            <Box height={expandTable ? 800 : 400} width="100%">
                <DataGrid
                    checkboxSelection
                    onSelectionChange={(newSelection) => {
                        setSelection(newSelection.rowIds);
                    }}
                    {...newData}
                />
            </Box>
            <Box
                display="flex"
                justifyContent="flex-end"
                p={2}
            >
                <Button
                    color="primary"
                    onClick={toggleTable}
                    endIcon={!expandTable && <ArrowRightIcon/>}
                    size="small"
                    variant="text"
                >
                    {expandTable ? "Show Less" : "See More"}
                </Button>
            </Box>
        </Card>
    );
};

UsersTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(UsersTable);
