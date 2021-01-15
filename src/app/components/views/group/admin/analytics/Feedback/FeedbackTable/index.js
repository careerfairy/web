import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid, getNumericColumnOperators} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "./Overlays";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
    filterModel,
    getCount,
    getDate,
    RatingInputValue,
    renderAppearAfter,
    renderLongText,
    renderRating
} from "../../common/TableUtils";



const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    displayGraphButton: {
        fontWeight: 500,
        color: theme.palette.primary.main
    },
}));


const FeedbackTable = ({
                           groupOptions,
                           fetchingStreams,
                           userType,
                           currentStream,
                           group,
                           futureStreams,
                           totalUniqueUsers,
                           tableRef,
                           streamsFromTimeFrameAndFuture,
                           setCurrentRating,
                           setCurrentPoll,
                           breakdownRef,
                           setStreamDataType,
                           streamDataType,
                           streamDataTypes,
                           className,
                           ...rest
                       }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [columns, setColumns] = useState([]);
    const [expandTable, setExpandTable] = useState(false);
    const [data, setData] = useState([]);


    useEffect(() => {
        const dataType = streamDataType.propertyName
        const newData = currentStream?.[dataType] || []
        setData(newData)
        if (dataType === "pollEntries") {
            setColumns(pollColumns)
        } else if (dataType === "questions") {
            setColumns(questionColumns)
        } else if (dataType === "feedback") {
            setColumns(feedbackColumns)
        }

    }, [streamDataType, currentStream])

    const DisplayButton = ({row}) => {
        const classes = useStyles()
        const hasNoData = () => {
            return Boolean(!row.voters?.length)
        }
        const handleClick = () => {
            const dataType = streamDataType.propertyName
            if (dataType === "feedback") {
                setCurrentRating(row)
            } else {
                setCurrentPoll(row)
            }
        }
        return (
            <Button
                className={classes.displayGraphButton}
                variant="text"
                disabled={hasNoData()}
                onClick={handleClick}
                fullWidth
                size="small"
            >
                {hasNoData() ? "No Data" : "Click for Breakdown"}
            </Button>
        )
    }


    const pollColumns = [
        {
            field: "question",
            headerName: "Question",
            width: 250,
            renderCell: renderLongText,
        },
        {
            field: "voters",
            headerName: "Votes",
            width: 90,
            type: 'number',
            valueGetter: getCount
        },
        {
            field: "options",
            headerName: "Graph",
            filterable: false,
            width: 150,
            renderCell: DisplayButton,
            disableClickEventBubbling: true,
        },
        {
            field: "state",
            headerName: "Status",
            width: 100,
        },
        {
            field: "timestamp",
            headerName: "Date Created",
            width: 200,
            type: 'dateTime',
            valueGetter: getDate
        },
    ]

    const questionColumns = [
        {
            field: "title",
            headerName: "Question",
            width: 250,
            renderCell: renderLongText,
        },
        {
            field: "votes",
            headerName: "Votes",
            width: 90,
            type: 'number',
        },
        {
            field: "timestamp",
            headerName: "Date Created",
            width: 200,
            type: 'dateTime',
            valueGetter: getDate
        },
        {
            field: "type",
            headerName: "status",
            width: 100,
        },
    ]
    const feedbackColumns = [
        {
            field: "question",
            headerName: "Question",
            width: 250,
            renderCell: renderLongText,
        },
        {
            field: "average",
            headerName: "Average Rating",
            width: 150,
            renderCell: renderRating,
            filterOperators: getNumericColumnOperators().map((operator) => ({
                ...operator,
                InputComponent: RatingInputValue,
            }))
        },
        {
            field: "appearAfter",
            headerName: "This question will appear after",
            width: 180,
            renderCell: renderAppearAfter
        },
        {
            field: "voters",
            headerName: "Votes",
            width: 100,
            valueGetter: getCount
        },
        {
            field: "options",
            headerName: "Breakdown",
            filterable: false,
            width: 180,
            renderCell: DisplayButton,
            disableClickEventBubbling: true,
        },
    ]

    const toggleTable = () => {
        setExpandTable(!expandTable)
    }

    const handleMenuItemClick = (event, index) => {
        setStreamDataType(streamDataTypes[index])
    };


    const newData = {
        columns: columns,
        rows: data
    }

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title={streamDataType.displayName}
                subheader={currentStream && `For ${currentStream.company} on ${prettyDate(currentStream.start)}`}
            />
            <Divider/>
            <Tabs
                value={streamDataType.propertyName}
                indicatorColor="primary"
                textColor="primary"
                scrollButtons="auto"
                aria-label="disabled tabs example"
            >
                {streamDataTypes.map(({displayName, propertyName}, index) => (
                        <Tab
                            key={propertyName}
                            value={propertyName}
                            onClick={(event) => handleMenuItemClick(event, index)}
                            label={`${displayName} - ${currentStream?.[propertyName]?.length || 0}`}
                        />
                    )
                )}
            </Tabs>
            <Divider/>
            <Box height={expandTable ? 800 : 400} width="100%">
                <DataGrid
                    {...newData}
                    ref={breakdownRef}
                    filterModel={filterModel}
                    loading={fetchingStreams}
                    onSelectionChange={(newSelection) => {
                        setSelection(newSelection.rowIds);
                    }}
                    components={{
                        noRowsOverlay: CustomNoRowsOverlay,
                        loadingOverlay: CustomLoadingOverlay,
                    }}
                />
            </Box>
            <Box
                display="flex"
                justifyContent="space-between"
                p={2}
            >
                <Button
                    color="primary"
                    onClick={toggleTable}
                    endIcon={!expandTable && <ArrowRightIcon/>}
                    size="small"
                    variant="text"
                >
                    {expandTable ? "Show Less" : "Expand"}
                </Button>
            </Box>
        </Card>
    );
};

FeedbackTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(FeedbackTable);
