import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Card, CardHeader, Divider, Grow, makeStyles} from '@material-ui/core';
import {withFirebase} from "../../../../../../../context/firebase";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
    exportSelectionAction,
    renderAppearAfter,
    renderRatingStars,
    StarRatingInputValue,
    tableIcons
} from "../../common/TableUtils";
import EditFeedbackModal from "./EditFeedbackModal";
import AreYouSureModal from "../../../../../../../materialUI/GlobalModals/AreYouSureModal";
import {useSnackbar} from "notistack";
import IconButton from "@material-ui/core/IconButton";
import MaterialTable from "material-table";
import FeedbackGraph from "../FeedbackGraph";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';


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
                           setCurrentStream,
                           setCurrentRating,
                           setCurrentPoll,
                           breakdownRef,
                           setStreamDataType,
                           streamDataType,
                           firebase,
                           currentPoll,
                           handleScrollToSideRef,
                           currentRating,
                           streamDataTypes,
                           className,
                           typesOfOptions,
                           userTypes,
                           setUserType,
                           sideRef,
                           ...rest
                       }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [tableData, setTableData] = useState({data: [], columns: []});
    const [feedbackModal, setFeedbackModal] = useState({data: {}, open: false})
    const [areYouSureModal, setAreYouSureModal] = useState({data: {}, open: false, warning: ""});
    const [deletingFeedback, setDeletingFeedback] = useState(false);
    const actions = [exportSelectionAction(tableData.columns)]
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
            data: newData,
            columns: newColumns
        })

    }, [streamDataType.propertyName, currentStream])


    const DisplayButton = (rowData) => {
        const hasNoData = () => {
            return Boolean(!rowData.voters?.length)
        }
        const handleClick = () => {
            setCurrentRating(rowData)
            handleScrollToSideRef()
        }
        return (
            <Box display="flex" justifyContent="center">
                <IconButton
                    color={currentRating?.id === rowData.id ? "primary" : "default"}
                    disabled={hasNoData()}
                    onClick={handleClick}>
                    <ArrowDownwardIcon/>
                </IconButton>
            </Box>
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
            title: "Question",
        },
        {
            title: "Votes",
            type: 'numeric',
            field: "votes",
        },
        {
            field: "state",
            title: "Status",
            lookup: {closed: 'Answered', upcoming: 'New', current: "Answering"},
        },
        {
            field: "date",
            title: "Date Created",
            type: 'date',
            render: (rowData) => prettyDate(rowData.timestamp),
        },
    ]

    const questionColumns = [
        {
            field: "title",
            title: "Question",
            width: 250,
        },
        {
            field: "votes",
            title: "Votes",
            width: 90,
            type: 'numeric',
        },
        {
            field: "date",
            title: "Posted On",
            type: 'date',
            render: (rowData) => prettyDate(rowData.timestamp),
        },
        {
            field: "type",
            title: "status",
            lookup: {done: 'Answered', new: 'New', current: "Answering"},
        },
    ]
    const feedbackColumns = [
        {
            field: "question",
            title: "Question",
            width: 250,
        },
        {
            field: "average",
            title: "Average Rating",
            width: 150,
            render: (rowData) => renderRatingStars({rating: rowData.average, id: rowData.id}),
            filterComponent: StarRatingInputValue,
            customFilterAndSearch: (term, rowData) => Number(term) >= Number(rowData.average)
        },
        {
            field: "appearAfter",
            title: "Appear After",
            width: 180,
            type: "numeric",
            render: renderAppearAfter
        },
        {
            field: "votes",
            title: "Votes",
            type: "numeric",
        },
        {
            field: "options",
            title: "Breakdown",
            width: 180,
            render: DisplayButton,
            filtering: false,
            sorting: false,
            disableClickEventBubbling: true,
            export: false
        },
        {
            field: "hasText",
            title: "Enabled Written Reviews",
            width: 140,
            lookup: {true: 'Yes', false: 'No'},
        },
        {
            field: "isForEnd",
            title: "Automatically ask once stream is over",
            width: 140,
            lookup: {true: 'Yes', false: 'No'},
        },
    ]

    const handleCloseFeedbackModal = () => {
        setFeedbackModal(prevState => ({...prevState, open: false}))
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
    const isPoll = () => {
        return Boolean(streamDataType.propertyName === "pollEntries")
    }

    if (isFeedback()) {
        actions.push({
                icon: tableIcons.EditIcon,
                position: "row",
                tooltip: 'Edit',
                onClick: (event, rowData) => handleEditFeedback(rowData)
            }, {
                icon: tableIcons.DeleteForeverIcon,
                position: "row",
                tooltip: 'Delete',
                onClick: (event, rowData) => handleOpenAreYouSureModal(rowData)
            },
            {
                icon: tableIcons.Add,
                position: "toolbar",
                iconProps: {color: "green"},
                tooltip: 'Add Question',
                onClick: handleCreateFeedback
            })
    }

    return (
        <>
            <Card
                raised={active()}
                className={clsx(classes.root, className)}
                ref={breakdownRef}
                {...rest}
            >
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
                <MaterialTable
                    icons={tableIcons}
                    {...tableData}
                    isLoading={fetchingStreams}
                    options={{
                        filtering: true,
                        selection: true,
                        pageSize: 5,
                        pageSizeOptions: [5, 10, 25, 50, 100, 200],
                        exportButton: {csv: true, pdf: false}
                    }}
                    actions={actions}
                    onSelectionChange={(rows) => {
                        setSelection(rows);
                    }}
                    title={
                        <CardHeader
                            title={streamDataType.displayName}
                            subheader={currentStream && `For ${currentStream.company} on ${prettyDate(currentStream.start)}`}
                        />
                    }
                    detailPanel={
                        isPoll() ? [{
                            tooltip: "Show Chart",
                            icon: tableIcons.InsertChartOutlinedIcon,
                            openIcon: tableIcons.InsertChartIcon,
                            render: rowData => {
                                return (
                                    <Grow in>
                                        <FeedbackGraph
                                            group={group}
                                            setCurrentStream={setCurrentStream}
                                            currentStream={currentStream}
                                            typesOfOptions={typesOfOptions}
                                            userTypes={userTypes}
                                            setUserType={setUserType}
                                            currentPoll={rowData}
                                            sideRef={sideRef}
                                            userType={userType}
                                            streamDataType={streamDataType}
                                        />
                                    </Grow>
                                )
                            },
                        }] : null
                    }
                />
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
