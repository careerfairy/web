import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Divider, makeStyles} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "./Overlays";

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
        width: 240,
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

const UsersTable = ({
                        groupOptions,
                        fetchingStreams,
                        userType,
                        currentStream,
                        group,
                        totalUniqueUsers,
                        livestreams,
                        className,
                        ...rest
                    }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const [columns, setColumns] = useState([]);
    const [expandTable, setExpandTable] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const categoryColumns = getGroupCategoryColumns()
        const newColumns = [...initialColumns]
        // Place the group category options before gender, streamsWatched, etc...
        newColumns.splice(4, 0, ...categoryColumns)
        setColumns(newColumns)
    }, [group.id])

    useEffect(() => {
        setUsers(totalUniqueUsers)
        mapUserCategories()
        mapStreamsWatched()

    }, [totalUniqueUsers])


    // console.log("-> fetchingStreams", fetchingStreams);
    // console.log("-> data", data);

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
                        // console.log("-> targetOption.name", targetOption.name);
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
            const currentUserEmail = user?.userEmail
            if (currentUserEmail) {
                const watchedStreams = []
                livestreams.forEach(stream => {
                    if (stream?.participatingStudents?.some(userObj => userObj?.userEmail === currentUserEmail)) {
                        watchedStreams.push(stream)
                    }
                })
                user.streamsWatched = watchedStreams.length
            }
            return user
        })
        setUsers(updatedUsers)
    }

    const toggleTable = () => {
        setExpandTable(!expandTable)
    }


    const newData = {
        columns: columns,
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
            <Box height={expandTable ? 800 : 400} width="100%">
                <DataGrid
                    loading={fetchingStreams}
                    showToolbar
                    components={{
                        noRowsOverlay: CustomNoRowsOverlay,
                        loadingOverlay: CustomLoadingOverlay,
                    }}
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
