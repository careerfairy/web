import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardHeader, Collapse, Divider, Grow, makeStyles, Slide, Zoom} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {DataGrid} from '@material-ui/data-grid';
import {withFirebase} from "../../../../../../../context/firebase";
import {copyStringToClipboard, prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {useSnackbar} from "notistack";
import {CustomLoadingOverlay, CustomNoRowsOverlay} from "../../common/Overlays";
import MaterialTable from "material-table";
import {tableIcons} from "../../common/TableUtils";

const useStyles = makeStyles(() => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
}));

const initialColumns = [
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
        field: "linkedinUrl",
        title: "LinkedIn",
        width: 180,
    },
    {
        field: "universityName",
        title: "University",
        width: 150,
    },
    {
        field: "streamsWatched",
        title: "Events Attended",
        width: 150,
    },
    {
        field: "streamsRegistered",
        title: "Events Registered To",
        width: 170,
    },
]
const UsersTable = ({
                        groupOptions,
                        fetchingStreams,
                        userType,
                        currentStream,
                        group,
                        futureStreams,
                        totalUniqueUsers,
                        streamsFromTimeFrameAndFuture,
                        breakdownRef,
                        className,
                        ...rest
                    }) => {
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    console.log("-> selection", selection);
    const {enqueueSnackbar} = useSnackbar()
    const [columns, setColumns] = useState([]);
    const [expandTable, setExpandTable] = useState(false);
    const [users, setUsers] = useState([]);
    const [checkboxSelection, setCheckboxSelection] = useState(false);
    const [gridData, setGridData] = useState({columns: initialColumns, data: []});

    useEffect(() => {
        const userProp = userType.propertyName
        const newColumns = [...initialColumns]
        if (currentStream) {
            newColumns.push({
                field: "watchedEvent",
                title: "Attended Event",
                width: 170,
            })
        }
        if (userProp === "talentPool") {
            newColumns.unshift({
                field: "userEmail",
                title: "Email",
                width: 200,
                renderCell: (params) => (
                    <a href={`mailto:${params.value}`}>
                        {params.value}
                    </a>
                ),
            })
        }
        setGridData({data: users, columns: newColumns})
    }, [userType.propertyName, currentStream, users])


    useEffect(() => {
        const categoryColumns = getGroupCategoryColumns()
        setColumns([...initialColumns, ...categoryColumns])
    }, [group.id, userType, currentStream])

    useEffect(() => {
        setUsers(totalUniqueUsers)
        mapUserCategories()
        mapStreamsWatched()
        mapStreamsRegistered()

    }, [totalUniqueUsers])

    useEffect(() => {
        if (userType.propertyName === "talentPool") {
            setCheckboxSelection(true)
        } else {
            setCheckboxSelection(false)
        }

    }, [userType.propertyName])

    const getGroupCategoryColumns = () => {
        if (group.categories?.length) {
            return group.categories.map(category => {
                return {
                    field: category.name,
                    title: category.name,
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

    const shouldHide = () => {
        const userProp = userType.propertyName
        return Boolean(
            !group.universityCode &&
            (userProp === "registeredUsers" || userProp === "participatingStudents")
        )
    }

    return (
        <Slide direction="up" unmountOnExit mountOnEnter in={!shouldHide()}>
            <Card
                raised={Boolean(currentStream)}
                className={clsx(classes.root, className)}
                {...rest}
            >
                <CardHeader
                    title={userType.displayName}
                    subheader={currentStream && `For ${currentStream.company} on ${prettyDate(currentStream.start)}`}
                />
                <Divider ref={breakdownRef}/>
                <Box
                    // height={expandTable ? 800 : 400}
                >
                    <MaterialTable
                        icons={tableIcons}
                        // columns={[
                        //     {title: "Adı", field: "name"},
                        //     {title: "Soyadı", field: "surname"},
                        //     {title: "Doğum Yılı", field: "birthYear", type: "numeric"},
                        //     {
                        //         title: "Doğum Yeri",
                        //         field: "birthCity",
                        //         lookup: {34: "İstanbul", 63: "Şanlıurfa"},
                        //     },
                        // ]}
                        {...gridData}
                        options={{
                            exportButton: true,
                            filtering: true,
                            selection: true
                        }}
                            onSelectionChange={(rows) => {
                                setSelection(rows);
                            }}
                        // data={[
                        //     {
                        //         name: "Mehmet",
                        //         surname: "Baran",
                        //         birthYear: 1987,
                        //         birthCity: 63,
                        //     },
                        // ]}
                        title="Demo Title"
                    />
                    {/*<DataGrid*/}
                    {/*    {...gridData}*/}
                    {/*    showToolbar*/}
                    {/*    onFilterModelChange={({filterModel}) => {*/}
                    {/*        const filterActive = filterModel.items?.[0]?.value*/}
                    {/*        if (filterActive) {*/}
                    {/*            setCheckboxSelection(false)*/}
                    {/*        } else {*/}
                    {/*            setCheckboxSelection(true)*/}
                    {/*        }*/}
                    {/*    }}*/}
                    {/*    checkboxSelection={checkboxSelection}*/}
                    {/*    loading={fetchingStreams}*/}
                    {/*    onSelectionChange={(newSelection) => {*/}
                    {/*        setSelection(newSelection.rowIds);*/}
                    {/*    }}*/}
                    {/*    components={{*/}
                    {/*        noRowsOverlay: CustomNoRowsOverlay,*/}
                    {/*        loadingOverlay: CustomLoadingOverlay,*/}

                    {/*    }}*/}
                    {/*/>*/}
                </Box>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    p={2}
                >
                    {userType.propertyName === "talentPool" &&
                    <Button
                        color="primary"
                        size="small"
                        variant="contained"
                        disabled={Boolean(!selection.length)}
                        onClick={handleCopyEmails}
                    >
                        Copy Email Addresses
                    </Button>}
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
        </Slide>
    );
};

UsersTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(UsersTable);
