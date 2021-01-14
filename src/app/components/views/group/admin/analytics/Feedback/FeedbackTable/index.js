import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {copyStringToClipboard, prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "./Overlays";
import {useSnackbar} from "notistack";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";

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
    }
}));


const FeedbackTable = ({
                           groupOptions,
                           fetchingStreams,
                           userType,
                           currentStream,
                           group,
                           futureStreams,
                           totalUniqueUsers,
                           streamsFromTimeFrameAndFuture,
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
        const newData = currentStream?.[streamDataType.propertyName]
        // console.log("-> newData", newData);
        if (newData) {
            setData(newData)
        }
    }, [streamDataType, currentStream])


    const toggleTable = () => {
        setExpandTable(!expandTable)
    }

    const handleCopyEmails = () => {
        copyStringToClipboard(selection.join(";"))
        enqueueSnackbar("Emails have been copied!", {
            variant: "success"
        })
    }
    // console.log("-> table");

    const getDate = (params) => {
        return prettyDate(params.value)
    }
    const getAuthorLastName = (params) => {
        return `${params.getValue('firstName') || ''} ${
            params.getValue('lastName') || ''
        }`;
    }

    const renderTitle = ({value}) => (
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


    const handleMenuItemClick = (event, index) => {
        setStreamDataType(streamDataTypes[index])
    };

    const questionColumns = [
        {
            field: "id",
            headerName: "ID",
            width: 170,
            hide: true
        },
        {
            field: "author",
            headerName: "Author's Email",
            width: 140,
        },
        {
            field: "firstName",
            headerName: "First Name",
            width: 140,
        },
        {
            field: "lastName",
            headerName: "Last Name",
            width: 150,
        },
        {
            field: "title",
            headerName: "Question",
            width: 250,
            renderCell: renderTitle,
        },
        {
            field: "votes",
            headerName: "Votes",
            width: 130,
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


    const newData = {
        columns: questionColumns,
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
