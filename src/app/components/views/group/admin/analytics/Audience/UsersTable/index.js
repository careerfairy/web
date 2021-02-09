import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Card, makeStyles, Slide} from '@material-ui/core';
import {withFirebase} from "../../../../../../../context/firebase";
import {copyStringToClipboard, prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {useSnackbar} from "notistack";
import MaterialTable from "material-table";
import {defaultTableOptions, exportSelectionAction, LinkifyText, tableIcons} from "../../common/TableUtils";
import UserInnerTable from "./UserInnerTable";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const useStyles = makeStyles((theme) => ({
    root: {},
    actions: {
        justifyContent: 'flex-end'
    },
    avatar: {
        height: 70,
        width: '80%',
        "& img": {
            objectFit: "contain"
        },
        boxShadow: theme.shadows[1]
    },
    streamManage: {
        background: theme.palette.navyBlue.main,
        color: theme.palette.common.white
    }
}));

const UsersTable = ({
                        groupOptions,
                        fetchingStreams,
                        userType,
                        currentStream,
                        group,
                        firebase,
                        setUserType,
                        futureStreams,
                        isFollowers,
                        handleReset,
                        totalUniqueUsers,
                        streamsFromTimeFrameAndFuture,
                        breakdownRef,
                        userTypes,
                        className,
                        ...rest
                    }) => {
    const dataTableRef = useRef(null)
    const {userData} = useAuth();
    const classes = useStyles();
    const [selection, setSelection] = useState([]);
    const {enqueueSnackbar} = useSnackbar()
    const [users, setUsers] = useState([]);

    const columns = [
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
            field: "universityCountry",
            title: "University Country",
            cellStyle: {
                width: 300,
            },
        },
        {
            field: "numberOfStreamsWatched",
            title: "Events Attended",
            width: 150,
        },
        {
            field: "numberOfStreamsRegistered",
            title: "Events Registered To",
            width: 170,
        },
        {
            field: "userEmail",
            title: "Email",
            width: 200,
            // hidden: userType.propertyName !== "talentPool",
            render: (params) => (
                <a href={`mailto:${params.value}`}>
                    {params.value}
                </a>
            ),
        },
        {
            field: "watchedEvent",
            title: "Attended Event",
            width: 170,
            hidden: !currentStream
        }
    ]

    useEffect(() => {
        setUsers(totalUniqueUsers)
        mapUserCategories()
        mapStreamsWatched()
        mapStreamsRegistered()
        setSelection([])

    }, [totalUniqueUsers])

    useEffect(() => {
        if (dataTableRef.current) {
            dataTableRef.current.onAllSelected(false)
        }
    }, [currentStream?.id])

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
        const groupCategories = group.categories ? [...group.categories] : []
        if (groupCategories.length) {
            const updatedUsers = totalUniqueUsers?.map(user => {
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
            user.watchedEvent = false
            const currentUserEmail = user.userEmail
            if (currentUserEmail) {
                const watchedStreams = []
                streamsFromTimeFrameAndFuture.forEach(stream => {
                    if (stream?.participatingStudents?.some(userEmail => userEmail === currentUserEmail)) {
                        watchedStreams.push(stream)
                        user.watchedEvent = true
                    }
                })
                user.numberOfStreamsWatched = watchedStreams.length
                user.streamsWatched = watchedStreams
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
                currentUser.numberOfStreamsRegistered = registeredStreams.length
                currentUser.streamsRegistered = registeredStreams
            }
            return currentUser
        })
        setUsers(updatedUsers)
    }

    const handleCopyEmails = () => {
        const emails = selection.map(user => user.id).join(";")
        copyStringToClipboard(emails)
        enqueueSnackbar("Emails have been copied!", {
            variant: "success"
        })
    }

    const handleCopyLinkedin = () => {
        const linkedInAddresses = selection.filter(user => user.linkedinUrl).map(user => user.linkedinUrl).join(",")
        if (linkedInAddresses?.length) {
            copyStringToClipboard(linkedInAddresses)
            enqueueSnackbar("LinkedIn addresses have been copied!", {
                variant: "success"
            })
        } else {
            enqueueSnackbar("None of your selections have linkedIn Addresses", {
                variant: "warning"
            })
        }
    }

    const shouldHide = () => {
        const userProp = userType.propertyName
        return Boolean(
            (!group.universityCode &&
                (userProp === "registeredUsers" || userProp === "participatingStudents")
            )
            && !userData?.isAdmin
        )
    }

    const handleMenuItemClick = (event, index) => {
        setUserType(userTypes[index])
    };


    const isTalentPool = () => userType.propertyName === "talentPool"

    const getTitle = () => currentStream ? `For ${currentStream.company} on ${prettyDate(currentStream.start)}` : "For all Events"

    return (
        <Slide direction="up" unmountOnExit mountOnEnter in={!shouldHide()}>
            <Card
                raised={Boolean(currentStream)}
                className={clsx(classes.root, className)}
                ref={breakdownRef}
                {...rest}
            >
                <Tabs
                    value={userType.propertyName}
                    indicatorColor="primary"
                    textColor="primary"
                    scrollButtons="auto"
                    aria-label="disabled tabs example"
                >
                    {userTypes.map(({displayName, propertyName}, index) => (
                        <Tab
                            key={propertyName}
                            value={propertyName}
                            onClick={(event) => handleMenuItemClick(event, index)}
                            label={displayName}
                        />
                    ))}
                </Tabs>
                <MaterialTable
                    icons={tableIcons}
                    tableRef={dataTableRef}
                    isLoading={fetchingStreams}
                    data={users}
                    options={defaultTableOptions}
                    columns={[
                        {
                            field: "firstName",
                            title: "First Name",
                            cellStyle: {
                                width: 300,
                            },
                        },
                        {
                            field: "lastName",
                            title: "Last Name",
                            cellStyle: {
                                width: 300,
                            },
                        },
                        {
                            field: "universityName",
                            title: "University",
                            cellStyle: {
                                width: 300,
                            },
                        },
                        {
                            field: "universityCountry",
                            title: "University Country",
                            cellStyle: {
                                width: 300,
                            },
                        },
                        {
                            field: "numberOfStreamsWatched",
                            title: "Events Attended",
                            type: "numeric"
                        },
                        {
                            field: "numberOfStreamsRegistered",
                            title: "Events Registered To",
                            type: "numeric"
                        },
                        {
                            field: "userEmail",
                            title: "Email",
                            // hidden: userType.propertyName !== "talentPool",
                            // export: userType.propertyName === "talentPool",
                            render: ({id}) => (
                                <a href={`mailto:${id}`}>
                                    {id}
                                </a>
                            ),
                            cellStyle: {
                                width: 300,
                            },
                        },
                        {
                            field: "linkedinUrl",
                            title: "LinkedIn",
                            render: (rowData) => LinkifyText(rowData.linkedinUrl),
                            cellStyle: {
                                width: 300,
                            },
                        },
                        {
                            field: "watchedEvent",
                            title: "Attended Event",
                            type: "boolean",
                            width: 170,
                            export: Boolean(currentStream),
                            hidden: Boolean(!currentStream)
                        }
                    ]}
                    detailPanel={[
                        ({numberOfStreamsRegistered, streamsRegistered, firstName, lastName}) => ({
                            icon: tableIcons.LibraryAddOutlinedIcon,
                            openIcon: tableIcons.AddToPhotosIcon,
                            tooltip: !(numberOfStreamsRegistered === 0) && `See streams ${firstName} registered to`,
                            disabled: numberOfStreamsRegistered === 0,
                            render: () => <UserInnerTable
                                firstName={firstName}
                                lastName={lastName}
                                group={group}
                                streams={streamsRegistered}
                                firebase={firebase}
                                registered
                            />
                        }),
                        ({numberOfStreamsWatched, streamsWatched, firstName, lastName}) => ({
                            icon: tableIcons.VideoLibraryOutlinedIcon,
                            openIcon: tableIcons.VideoLibraryIcon,
                            tooltip: !(numberOfStreamsWatched === 0) && `See streams ${firstName} watched`,
                            disabled: numberOfStreamsWatched === 0,
                            render: () => <UserInnerTable
                                firstName={firstName}
                                lastName={lastName}
                                firebase={firebase}
                                group={group}
                                streams={streamsWatched}
                            />
                        })

                    ]}
                    actions={[
                        exportSelectionAction(columns, getTitle()),
                        (rowData) => ({
                            tooltip: !(rowData.length === 0
                                // || !isTalentPool()
                            ) && "Copy Emails",
                            position: "toolbarOnSelect",
                            icon: tableIcons.EmailIcon,
                            disabled: (rowData.length === 0
                                // || !isTalentPool()
                            ),
                            onClick: handleCopyEmails
                        }),
                        (rowData) => ({
                            tooltip: !(rowData.length === 0
                                // || !isTalentPool()
                            ) && "Copy LinkedIn Addresses",
                            position: "toolbarOnSelect",
                            icon: tableIcons.LinkedInIcon,
                            disabled: (rowData.length === 0
                                // || !isTalentPool()
                            ),
                            onClick: handleCopyLinkedin
                        }),
                        {
                            disabled: !Boolean(currentStream),
                            tooltip: currentStream && "Set back to overall",
                            isFreeAction: true,
                            icon: tableIcons.RotateLeftIcon,
                            hidden: !Boolean(currentStream),
                            onClick: handleReset
                        }
                    ]}
                    onSelectionChange={(rows) => {
                        setSelection(rows);
                    }}
                    title={getTitle()}
                />
            </Card>
        </Slide>
    );
};

UsersTable.propTypes = {
    className: PropTypes.string
};

export default withFirebase(UsersTable);
