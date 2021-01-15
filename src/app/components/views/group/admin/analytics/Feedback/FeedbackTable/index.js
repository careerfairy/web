import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid, getNumericColumnOperators} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {copyStringToClipboard, prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "./Overlays";
import {useSnackbar} from "notistack";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import { Rating } from '@material-ui/lab';


const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    gridWrapper: {
        '& .link': {
            backgroundColor: 'rgba(224, 183, 60, 0.55)',
            color: '#1a3e72',
            fontWeight: '600',
        },
    },
    tableTooltipQuestion: {
        fontSize: theme.spacing(2)
    },
    displayGraphButton: {
        fontWeight: 500,
        color: theme.palette.primary.main
    },
    ratingInput: {
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingLeft: 20,
    }
}));

const getDate = (params) => {
    return prettyDate(params.value)
}
const getCount = ({value}) => {
    return value ? value.length : 0
}
const renderLongText = ({value}) => {
    const classes = useStyles()
    return (
        <Tooltip title={
            <Typography className={classes.tableTooltipQuestion}>
                {value}
            </Typography>
        }>
            <Typography variant="inherit" noWrap>
                {value}
            </Typography>
        </Tooltip>
    )
}

function RatingInputValue(props) {
    const classes = useStyles();
    const { item, applyValue } = props;

    const handleFilterChange = (event) => {
        applyValue({ ...item, value: event.target.value });
    };

    return (
        <div className={classes.ratingInput}>
            <Rating
                name="custom-rating-filter-operator"
                placeholder="Filter value"
                value={Number(item.value)}
                onChange={handleFilterChange}
                precision={0.5}
            />
        </div>
    );
}


const filterModel = {
    items: [{ columnField: 'rating', value: '3.5', operatorValue: '>=' }],
};


const FeedbackTable = ({
                           groupOptions,
                           fetchingStreams,
                           userType,
                           currentStream,
                           group,
                           futureStreams,
                           totalUniqueUsers,
                           streamsFromTimeFrameAndFuture,
                           setCurrentPoll,
                           setStreamDataType,
                           streamDataType,
                           streamDataTypes,
                           className,
                           ...rest
                       }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const {enqueueSnackbar} = useSnackbar()
    const [columns, setColumns] = useState([]);
    const [expandTable, setExpandTable] = useState(false);
    const [data, setData] = useState([]);


    useEffect(() => {
        const dataType = streamDataType.propertyName
        const newData = currentStream?.[dataType] || []
        console.log("-> newData", newData);
        setData(newData)
        if (dataType === "pollEntries") {
            setColumns(pollColumns)
        } else if (dataType === "questions") {
            setColumns(questionColumns)
        }
    }, [streamDataType, currentStream])
    //
    // React.useEffect(() => {
    //     if (data.columns.length > 0) {
    //         const ratingColumn = data.columns.find((column) => column.field === 'rating');
    //
    //         ratingColumn.filterOperators = getNumericColumnOperators().map((operator) => ({
    //             ...operator,
    //             InputComponent: RatingInputValue,
    //         }));
    //
    //         setColumns(data.columns);
    //     }
    // }, [data.columns]);

    const DisplayButton = ({row}) => {
        const classes = useStyles()
        const hasNoData = () => {
            return Boolean(!row.voters?.length)
        }
        return (
            <Button
                className={classes.displayGraphButton}
                variant="text"
                disabled={hasNoData()}
                onClick={() => setCurrentPoll(row)}
                fullWidth
                size="small"
            >
                {hasNoData() ? "No Data" : "Display"}
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
            field: "universityName",
            headerName: "University",
            width: 150,
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
            width: 130,
            type: 'number',
        },
        {
            field: "universityName",
            headerName: "University",
            width: 150,
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
    const ratingColumns = [
        {
            field: "rating",
            headerName: "Rating",
            width: 250,
        },
        {
            field: "timestamp",
            headerName: "Rated on",
            width: 130,
            type: 'date',
        },
        {
            field: "universityName",
            headerName: "University",
            width: 150,
        },
        {
            field: "ratingText",
            headerName: "Rating Message",
            width: 220,
        }
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
                {streamDataTypes.map(({displayName, propertyName}, index) => {
                    return (
                        <Tab
                            key={propertyName}
                            value={propertyName}
                            onClick={(event) => handleMenuItemClick(event, index)}
                            label={`${displayName} - ${currentStream?.[propertyName]?.length || 0}`}
                        />
                    )
                })}
            </Tabs>
            <Divider/>
            <Box className={classes.gridWrapper} height={expandTable ? 800 : 400} width="100%">
                <DataGrid
                    {...newData}
                    showToolbar
                    checkboxSelection
                    loading={fetchingStreams}
                    onSelectionChange={(newSelection) => {
                        // console.log("-> newSelection", newSelection);
                        setSelection(newSelection.rowIds);
                    }}
                    onSortModelChange={(sortModelParams) => {
                        // console.log("-> sortModelParams", sortModelParams);
                        // console.log("-> sortModelParams.api.state.filter", sortModelParams.api.state.filter);
                    }}
                    onPageChange={(pageChangeParams) => {
                        // console.log("-> pageChangeParams", pageChangeParams);
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
                {/*<Button*/}
                {/*    color="primary"*/}
                {/*    size="small"*/}
                {/*    variant="contained"*/}
                {/*    disabled={Boolean(!selection.length)}*/}
                {/*    onClick={handleCopyEmails}*/}
                {/*>*/}
                {/*    Copy Email Addresses*/}
                {/*</Button>*/}
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
