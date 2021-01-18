import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid, getNumericColumnOperators} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
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
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "../../common/Overlays";
import EditFeedbackModal from "./EditFeedbackModal";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AreYouSureModal from "../../../../../../../materialUI/GlobalModals/AreYouSureModal";
import {useSnackbar} from "notistack";


const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    displayGraphButton: {
        fontWeight: 500,
        color: theme.palette.primary.main
    },
    deleteButton: {
        color: theme.palette.error.main
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
                           tableRef,
                           streamsFromTimeFrameAndFuture,
                           setCurrentRating,
                           setCurrentPoll,
                           breakdownRef,
                           setStreamDataType,
                           streamDataType,
                           firebase,
                           currentPoll,
                           currentRating,
                           streamDataTypes,
                           className,
                           ...rest
                       }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [expandTable, setExpandTable] = useState(false);
    const [tableData, setTableData] = useState({rows: [], columns: []});
    const [feedbackModal, setFeedbackModal] = useState({data: {}, open: false})
    const [areYouSureModal, setAreYouSureModal] = useState({data: {}, open: false, warning: ""});
    const [deletingFeedback, setDeletingFeedback] = useState(false);
    const {enqueueSnackbar} = useSnackbar()


    useEffect(() => {
        const dataType = streamDataType.propertyName
        const newData = currentStream?.[dataType] || []
        let newColumns = tableData.columns
        if (dataType === "pollEntries") {
            newColumns = pollColumns
        } else if (dataType === "questions") {
            newColumns = questionColumns
        } else if (dataType === "feedback") {
            newColumns = feedbackColumns
        }
        setTableData({
            rows: newData,
            columns: newColumns
        })

    }, [streamDataType.propertyName, currentStream])

    const DisplayButton = ({row}) => {
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
                {hasNoData() ? "No Data" : "Breakdown"}
            </Button>
        )
    }


    const EditButton = (row) => {
        return (
            <Button
                onClick={() => handleEditFeedback(row)}
                startIcon={<EditIcon/>} color="primary"
                size="small"
            >
                Edit
            </Button>
        )
    }
    const DeleteButton = (row) => {
        return (
            <Button
                className={classes.deleteButton}
                onClick={() => handleOpenAreYouSureModal(row)}
                startIcon={<DeleteForeverIcon/>}
                color="primary"
                size="small"
            >
                Delete
            </Button>
        )
    }
    const handleEditFeedback = (row) => {
        setFeedbackModal({data: row, open: true})
    }
    const handleCreateFeedback = () => {
        setFeedbackModal({data: {}, open: true})
    }
    const handleOpenAreYouSureModal = (row) => {
        const warning = `Are you sure you want to delete the question "${row.question}"? You wont be able to revert this action`
        setAreYouSureModal({data: row, open: true, warning})
    }

    const handleDeleteFeedback = async () => {
        try {
            setDeletingFeedback(true)
            const {id: livestreamId} = currentStream
            const {id: feedbackId} = areYouSureModal.data
            if (livestreamId && feedbackId) {
                await firebase.deleteFeedbackQuestion(livestreamId, feedbackId)
            }
            handleCloseAreYouSureModal()
        } catch (e) {
            enqueueSnackbar("Something went wrong, please refresh the page", {
                variant: "error",
                preventDuplicate: true
            })
            handleCloseAreYouSureModal()
        }
        setDeletingFeedback(false)
    }

    const handleCloseAreYouSureModal = () => {
        setAreYouSureModal({data: {}, open: false, warning: ""})
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
            field: "edit",
            headerName: "Edit",
            renderCell: ({row}) => EditButton(row),
            filterable: false,
            disableClickEventBubbling: true,
        },
        {
            field: "delete",
            headerName: "Delete",
            renderCell: ({row}) => DeleteButton(row),
            filterable: false,
            disableClickEventBubbling: true,
        },
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
            field: "hasText",
            headerName: "Enabled Written Reviews",
            width: 140,
            valueGetter: ({value}) => value ? "Yes" : "No"
        },
        {
            field: "options",
            headerName: "Breakdown",
            width: 180,
            renderCell: DisplayButton,
            filterable: false,
            disableClickEventBubbling: true,
        },
    ]

    const handleCloseFeedbackModal = () => {
        setFeedbackModal(prevState => ({...prevState, open: false}))
    }

    const toggleTable = () => {
        setExpandTable(!expandTable)
    }

    const handleMenuItemClick = (event, index) => {
        setStreamDataType(streamDataTypes[index])
    };

    const active = () => {
        return Boolean(
            currentStream && !currentRating && !currentPoll
        )
    }

    const isFeedback = () => {
        return Boolean(streamDataType.propertyName === "feedback")
    }

    return (
        <>
            <Card
                raised={active()}
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
                                label={`${displayName} - ${fetchingStreams ? "..." : currentStream?.[propertyName]?.length || 0}`}
                            />
                        )
                    )}
                </Tabs>
                <Divider/>
                <Box height={expandTable ? 800 : 400} width="100%">
                    <DataGrid
                        {...tableData}
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
                    {isFeedback() &&
                    <Button
                        startIcon={<AddIcon/>}
                        color="primary"
                        disabled={feedbackModal.open}
                        variant="contained"
                        onClick={handleCreateFeedback}
                    >
                        Add Question
                    </Button>
                    }
                </Box>
            </Card>
            <EditFeedbackModal
                currentStream={currentStream}
                handleClose={handleCloseFeedbackModal}
                state={feedbackModal}
            />
            <AreYouSureModal
                open={areYouSureModal.open}
                message={areYouSureModal.warning}
                handleConfirm={handleDeleteFeedback}
                loading={deletingFeedback}
                handleClose={handleCloseAreYouSureModal}
                title="Warning"
            />
        </>
    );
};

FeedbackTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(FeedbackTable);
