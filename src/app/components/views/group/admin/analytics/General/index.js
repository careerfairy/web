import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid} from "@material-ui/core";
import TotalRegistrations from "./TotalRegistrations";
import TotalUniqueRegistrations from "./TotalUniqueRegistrations";
import TypeOfParticipants from "./TypeOfParticipants";
import AverageRegistrations from "./AverageRegistrations";
import {mustBeNumber, snapShotsToData} from "../../../../../helperFunctions/HelperFunctions";
import NumberOfFollowers from "./NumberOfFollowers";
import {makeStyles} from "@material-ui/core/styles";
import LatestEvents from "../common/LatestEvents";


const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
        width: "100%"
    }
}))
const General = ({
                     group,
                     fetchingStreams,
                     globalTimeFrame,
                     futureStreams,
                     streamsFromBeforeTimeFrame,
                     streamsFromTimeFrame,
                     streamsFromTimeFrameAndFuture,
                     totalFollowers,
                     userTypes,
                     userType,
                     setUserType,
                     groupOptions,
                     fetchingFollowers,
                 }) => {
    const classes = useStyles()
    const [currentStream, setCurrentStream] = useState(null);

    const getTotalRegisteredUsers = (streamsArray) => {
        const total = streamsArray.reduce(
            (accumulator, {registeredUsers}) =>
                accumulator + registeredUsers.length,
            0
        );
        // Checks if the result is a number
        return mustBeNumber(total);
    };

    const getTotal = (streamsArray, prop) => {
        return streamsArray.reduce(
            (accumulator, livestream) => {
                return [...accumulator, ...livestream[prop]];
            },
            []
        );
    }

    const getUniqueIds = (arrayOfIds) => {
        return [...new Set(arrayOfIds)]
    }

    const getUniqueUsers = (streamsArray, prop) => {
        const totalViewers = getTotal(streamsArray, prop)
        // new Set method removes all duplicates from array
        return totalViewers.filter(function (el) {
            if (!this[el.userEmail]) {
                this[el.userEmail] = true;
                return true;
            }
            return false;
        }, Object.create(null));
    };

    const getAverageRegistrationsPerEvent = () => {
        const average = totalRegistrations / streamsFromTimeFrameAndFuture.length;
        return mustBeNumber(average, 0);
    };

    const compareRegistrations = () => {
        const registrationsFromTimeFrame = getTotal(streamsFromTimeFrameAndFuture, "registeredUsers").length
        const registrationsFromBeforeTimeFrame = getTotal(streamsFromBeforeTimeFrame, "registeredUsers").length
        const {
            positive,
            percentage,
        } = getStats(registrationsFromTimeFrame, registrationsFromBeforeTimeFrame)

        return {
            positive,
            percentage: `${percentage}%`,
            dataToCompare: Boolean(registrationsFromBeforeTimeFrame && registrationsFromTimeFrame)
        }
    }

    const compareUniqueRegistrations = () => {
        const totalRegistrationsFromTimeFrame = getTotal(streamsFromTimeFrameAndFuture, "registeredUsers")
        const totalRegistrationsFromBeforeTimeFrame = getTotal(streamsFromBeforeTimeFrame, "registeredUsers")
        const uniqueRegistrationsFromTimeFrame = getUniqueIds(totalRegistrationsFromTimeFrame).length
        const uniqueRegistrationsFromBeforeTimeFrame = getUniqueIds(totalRegistrationsFromBeforeTimeFrame).length
        const {
            positive,
            percentage,
        } = getStats(uniqueRegistrationsFromTimeFrame, uniqueRegistrationsFromBeforeTimeFrame)

        return {
            positive,
            percentage: `${percentage}%`,
            dataToCompare: Boolean(uniqueRegistrationsFromBeforeTimeFrame && uniqueRegistrationsFromTimeFrame)
        }
    }

    const getStats = (lastMonthsRegistrations, lastTwoMonthsRegistrations) => {
        const difference = lastMonthsRegistrations - lastTwoMonthsRegistrations
        const positive = Boolean(lastMonthsRegistrations > lastTwoMonthsRegistrations)
        let percentage
        if (difference > 0) {
            percentage = (difference / (lastTwoMonthsRegistrations || 1)) * 100
        } else {
            percentage = (difference / (lastMonthsRegistrations || 1)) * 100
        }
        return {
            positive,
            percentage: mustBeNumber(percentage, 0)
        }
    }

    const getTotalUniqueUsers = (streamsArray) => {
        const totalUsers = getTotal(streamsArray, "registeredUsers")
        return getUniqueIds(totalUsers).length
    }

    const getAggregateCategories = (participants) => {
        let categories = []
        participants.forEach(user => {
            const matched = user.registeredGroups?.find(groupData => groupData.groupId === group.id)
            if (matched) {
                categories.push(matched)
            }
        })
        return categories
    }

    const getTypeOfStudents = (prop) => {
        let students = []
        if (currentStream?.[prop]) {
            students = currentStream[prop]
        } else {//Get total Students
            students = getUniqueUsers(streamsFromTimeFrameAndFuture, prop)
        }
        const aggregateCategories = getAggregateCategories(students)
        const flattenedGroupOptions = [...groupOptions]
        flattenedGroupOptions.forEach(option => {
            option.count = aggregateCategories.filter(category => category.categories.some(userOption => userOption.selectedValueId === option.id)).length
        })
        return flattenedGroupOptions.sort((a, b) => b.count - a.count);
    }

    const getTotalFollowers = () => {
        return totalFollowers ? totalFollowers.length : 0
    }


    // use Memo is great for optimizing expensive calculations, the value of the function call will be stored in memory
    // The function will only be re-called when the value(streamsFromTimeFrame) in the dependency array changes


    const totalRegistrations = useMemo(() => getTotalRegisteredUsers(streamsFromTimeFrameAndFuture), [
        streamsFromTimeFrameAndFuture,
    ]);

    const totalUniqueRegistrations = useMemo(() => getTotalUniqueUsers(streamsFromTimeFrameAndFuture), [
        streamsFromTimeFrameAndFuture,
    ]);

    const averageRegistrations = useMemo(
        () => getAverageRegistrationsPerEvent(),
        [streamsFromTimeFrameAndFuture]
    );

    const registrationsStatus = useMemo(
        () => compareRegistrations(),
        [streamsFromTimeFrameAndFuture, streamsFromBeforeTimeFrame]
    );
    const uniqueRegistrationsStatus = useMemo(
        () => compareUniqueRegistrations(),
        [streamsFromTimeFrameAndFuture, streamsFromBeforeTimeFrame]
    );

    const typesOfOptions = useMemo(
        () => getTypeOfStudents(userType.propertyDataName),
        [streamsFromTimeFrameAndFuture, currentStream, userType]
    );

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>

                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalRegistrations
                        fetchingStreams={fetchingStreams}
                        registrationsStatus={registrationsStatus}
                        totalRegistrations={totalRegistrations}
                        timeFrames={globalTimeFrame.timeFrames}
                        globalTimeFrame={globalTimeFrame}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalUniqueRegistrations
                        fetchingStreams={fetchingStreams}
                        uniqueRegistrationsStatus={uniqueRegistrationsStatus}
                        totalUniqueRegistrations={totalUniqueRegistrations}
                        timeFrames={globalTimeFrame.timeFrames}
                        globalTimeFrame={globalTimeFrame}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <AverageRegistrations
                        fetchingStreams={fetchingStreams}
                        averageRegistrations={averageRegistrations}
                        timeFrames={globalTimeFrame.timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <NumberOfFollowers
                        fetchingFollowers={fetchingFollowers}
                        totalFollowers={getTotalFollowers()}
                        timeFrames={globalTimeFrame.timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={8} md={12} xl={9} xs={12}>
                    <LatestEvents
                        timeFrames={globalTimeFrame.timeFrames}
                        setCurrentStream={setCurrentStream}
                        futureStreams={futureStreams}
                        streamsFromTimeFrame={streamsFromTimeFrame}
                        userType={userType}
                        userTypes={userTypes}
                        setUserType={setUserType}
                        group={group}
                    />
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <TypeOfParticipants
                        currentStream={currentStream}
                        typesOfOptions={typesOfOptions}
                        userType={userType}
                        setCurrentStream={setCurrentStream}
                        group={group}
                    />
                </Grid>
            </Grid>
        </Container>

    );
};

export default General;
