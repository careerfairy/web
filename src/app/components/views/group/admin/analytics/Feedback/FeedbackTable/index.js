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

const useStyles = makeStyles(() => ({
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
                        className,
                        ...rest
                    }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const {enqueueSnackbar} = useSnackbar()
    const [columns, setColumns] = useState([]);
    const [expandTable, setExpandTable] = useState(false);
    const [users, setUsers] = useState([]);

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
            width: 140,
        },
        {
            field: "lastName",
            headerName: "Last Name",
            width: 140,
        },
        {
            field: "streamsWatched",
            headerName: "Events Attended",
            width: 150,
        },
        {
            field: "streamsRegistered",
            headerName: "Events Registered To",
            width: 170,
        },
    ]

    useEffect(() => {
        setUsers(totalUniqueUsers)
        mapUserCategories()
        mapStreamsWatched()
        mapStreamsRegistered()

    }, [totalUniqueUsers])

    const getGroupCategoryColumns = () => {
        if (group.categories?.length) {
            return group.categories.map(category => {
                return {
                    field: category.name,
                    headerName: category.name,
                    width: 170,
                }
            })
        } else {
            return []
        }
    }

    const getCategoryOptionName = (targetCategoryId, user) => {
        if (user.registeredGroups) {
            const targetGroup = user.registeredGroups.find(groupObj => groupObj.groupId === group.id)
            if (targetGroup?.categories) {
                const targetCategory = targetGroup.categories.find(categoryObj => categoryObj.id === targetCategoryId)
                if (targetCategory?.selectedValueId) {
                    const targetOption = groupOptions.find(option => option.id === targetCategory.selectedValueId)
                    if (targetOption?.name) {
                        return targetOption.name
                    }
                }
            }
        }
    }

    const mapUserCategories = () => {
        const groupCategories = [...group.categories]
        if (groupCategories.length) {
            const updatedUsers = totalUniqueUsers.map(user => {
                const updatedUser = user
                groupCategories.forEach(category => {
                    const targetCategoryId = category.id
                    if (targetCategoryId) {
                        const propertyName = category.name
                        updatedUser[propertyName] = getCategoryOptionName(targetCategoryId, user)
                    }
                })
                return updatedUser
            })
            setUsers(updatedUsers)
        }
    }

    const mapStreamsWatched = () => {
        const updatedUsers = totalUniqueUsers.map(user => {
            user.watchedEvent = "No"
            const currentUserEmail = user.userEmail
            if (currentUserEmail) {
                const watchedStreams = []
                streamsFromTimeFrameAndFuture.forEach(stream => {
                    if (stream?.participatingStudents?.some(userEmail => userEmail === currentUserEmail)) {
                        watchedStreams.push(stream)
                        user.watchedEvent = "Yes"
                    }
                })
                user.streamsWatched = watchedStreams.length
            }
            return user
        })
        setUsers(updatedUsers)
    }
    const mapStreamsRegistered = () => {
        const updatedUsers = totalUniqueUsers.map(currentUser => {
            if (currentUser.userEmail) {
                const registeredStreams = []
                streamsFromTimeFrameAndFuture.forEach(stream => {
                    if (stream?.registeredUsers?.some(userEmail => userEmail === currentUser.userEmail)) {
                        registeredStreams.push(stream)
                    }
                })
                currentUser.streamsRegistered = registeredStreams.length
            }
            return currentUser
        })
        setUsers(updatedUsers)
    }


    const toggleTable = () => {
        setExpandTable(!expandTable)
    }

    const handleCopyEmails = () => {
        copyStringToClipboard(selection.join(";"))
        enqueueSnackbar("Emails have been copied!", {
            variant: "success"
        })
    }


    const newData = {
        columns: initialColumns,
        rows: users
    }

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardHeader
                title={userType.displayName}
                subheader={currentStream && `That attended ${currentStream.company} on ${prettyDate(currentStream.start)}`}
            />
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
                        console.log("-> pageChangeParams", pageChangeParams);
                    }}
                    components={{
                        noRowsOverlay: CustomNoRowsOverlay,
                        loadingOverlay: CustomLoadingOverlay,
                    }}
                />
            </Box>
            {/*<Box*/}
            {/*    display="flex"*/}
            {/*    justifyContent="space-between"*/}
            {/*    p={2}*/}
            {/*>*/}
            {/*    <Button*/}
            {/*        color="primary"*/}
            {/*        size="small"*/}
            {/*        variant="contained"*/}
            {/*        disabled={Boolean(!selection.length)}*/}
            {/*        onClick={handleCopyEmails}*/}
            {/*    >*/}
            {/*        Copy Email Addresses*/}
            {/*    </Button>*/}
            {/*    <Button*/}
            {/*        color="primary"*/}
            {/*        onClick={toggleTable}*/}
            {/*        endIcon={!expandTable && <ArrowRightIcon/>}*/}
            {/*        size="small"*/}
            {/*        variant="text"*/}
            {/*    >*/}
            {/*        {expandTable ? "Show Less" : "Expand"}*/}
            {/*    </Button>*/}
            {/*</Box>*/}
        </Card>
    );
};

FeedbackTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(FeedbackTable);
