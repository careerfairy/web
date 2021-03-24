import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid, Tooltip} from "@material-ui/core";
import TotalRegistrations from "./TotalRegistrations";
import TotalUniqueRegistrations from "./TotalUniqueRegistrations";
import CategoryBreakdown from "./CategoryBreakdown";
import AverageRegistrations from "./AverageRegistrations";
import {mustBeNumber} from "../../../../../helperFunctions/HelperFunctions";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import LatestEvents from "../common/LatestEvents";
import UserCount from "./UserCount";
import TotalUniqueParticipatingStudents from "./TotalUniqueParticipatingStudents";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
    getTotalEmailsFromStreamsByProperty,
    getTypeOfStudents,
    getUniqueIds
} from "../../../../../../data/util/AnalyticsUtil";


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
                     loading,
                     globalTimeFrame,
                     futureStreams,
                     streamsFromBeforeTimeFrame,
                     streamsFromTimeFrame,
                     streamsFromTimeFrameAndFuture,
                     handleScrollToBreakdown,
                     handleReset,
                     userDataSet,
                     userTypes,
                     userType,
                     setUserType,
                     breakdownRef,
                     handleToggleBar,
                     setCurrentStream,
                     currentUserDataSet,
                     currentStream,
                     showBar
                 }) => {
    const classes = useStyles()
    const [currentCategory, setCurrentCategory] = useState({options: []});
    const [localUserType, setLocalUserType] = useState(userTypes[0]);
    const theme = useTheme()
    const mediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (group.categories?.length) {
            setCurrentCategory({...group.categories[0]})
        }

    }, [group.categories])

    const getTotalRegisteredUsers = (streamsArray) => {
        const total = streamsArray.reduce(
            (accumulator, {registeredUsers}) =>
                accumulator + mustBeNumber(registeredUsers?.length || 0),
            0
        );
        // Checks if the result is a number
        return mustBeNumber(total);
    };

    const getAverageRegistrationsPerEvent = () => {
        const average = totalRegistrations / streamsFromTimeFrameAndFuture.length;
        return mustBeNumber(average, 0);
    };

    const compareRegistrations = () => {
        const registrationsFromTimeFrame = getTotalEmailsFromStreamsByProperty(streamsFromTimeFrame, "registeredUsers").length
        const registrationsFromBeforeTimeFrame = getTotalEmailsFromStreamsByProperty(streamsFromBeforeTimeFrame, "registeredUsers").length
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

    const compareUniqueRegistrations = (prop) => {
        const totalUsersFromTimeFrame = getTotalEmailsFromStreamsByProperty(streamsFromTimeFrame, prop)
        const totalUsersFromBeforeTimeFrame = getTotalEmailsFromStreamsByProperty(streamsFromBeforeTimeFrame, prop)
        const uniqueUsersFromTimeFrame = getUniqueIds(totalUsersFromTimeFrame).length
        const uniqueUsersFromBeforeTimeFrame = getUniqueIds(totalUsersFromBeforeTimeFrame).length
        const {
            positive,
            percentage,
        } = getStats(uniqueUsersFromTimeFrame, uniqueUsersFromBeforeTimeFrame)

        return {
            positive,
            percentage: `${percentage}%`,
            dataToCompare: Boolean(uniqueUsersFromBeforeTimeFrame && uniqueUsersFromTimeFrame)
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
        const totalUsers = getTotalEmailsFromStreamsByProperty(streamsArray, "registeredUsers")
        return getUniqueIds(totalUsers).length
    }

    const getTotalUniqueParticipants = (streamsArray) => {
        const totalUsers = getTotalEmailsFromStreamsByProperty(streamsArray, "participatingStudents")
        return getUniqueIds(totalUsers).length
    }


    const getTotalUserDataSetCount = () => {
        return userDataSet?.length
    }


    // use Memo is great for optimizing expensive calculations, the value of the function call will be stored in memory
    // The function will only be re-called when the value(streamsFromTimeFrame) in the dependency array changes
    const isUni = currentUserDataSet.dataSet === "groupUniversityStudents"

    const totalRegistrations = useMemo(() => getTotalRegisteredUsers(streamsFromTimeFrameAndFuture), [
        streamsFromTimeFrameAndFuture,
    ]);

    const totalUniqueRegistrations = useMemo(() => getTotalUniqueUsers(streamsFromTimeFrameAndFuture), [
        streamsFromTimeFrameAndFuture,
    ]);

    const totalUniqueParticipatingStudents = useMemo(() => getTotalUniqueParticipants(streamsFromTimeFrameAndFuture), [
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
        () => compareUniqueRegistrations("registeredUsers"),
        [streamsFromTimeFrameAndFuture, streamsFromBeforeTimeFrame]
    );
    const uniqueParticipationStatus = useMemo(
        () => compareUniqueRegistrations("participatingStudents"),
        [streamsFromTimeFrameAndFuture, streamsFromBeforeTimeFrame]
    );

    const typesOfOptions = useMemo(
        () => getTypeOfStudents(localUserType.propertyDataName,
            {
                currentStream,
                currentCategory,
                group,
                streamsFromTimeFrameAndFuture
            }),
        [streamsFromTimeFrameAndFuture, currentStream, localUserType, currentCategory.id]
    );

    const getCategoryProps = () => ({item: true, xs: 12, sm: 6, lg: 3, xl: 3})
    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>

                <Tooltip arrow
                         title={`This block displays the total number of registrations for all your events over the past ${globalTimeFrame.name}.`}>
                    <Grid {...getCategoryProps()}>
                        <TotalRegistrations
                            fetchingStreams={loading}
                            registrationsStatus={registrationsStatus}
                            totalRegistrations={totalRegistrations}
                            timeFrames={globalTimeFrame.timeFrames}
                            globalTimeFrame={globalTimeFrame}
                            group={group}
                        />
                    </Grid>
                </Tooltip>
                <Tooltip arrow
                         title={`This block displays the total number of individual users who registered to your events over the past ${globalTimeFrame.name}.`}>
                    <Grid {...getCategoryProps()}>
                        <TotalUniqueRegistrations
                            fetchingStreams={loading}
                            uniqueRegistrationsStatus={uniqueRegistrationsStatus}
                            totalUniqueRegistrations={totalUniqueRegistrations}
                            timeFrames={globalTimeFrame.timeFrames}
                            globalTimeFrame={globalTimeFrame}
                            group={group}
                        />
                    </Grid>
                </Tooltip>
                <Tooltip arrow
                         title={`This block displays the average number of registrations per event over the past ${globalTimeFrame.name}.`}>
                    <Grid {...getCategoryProps()}>
                        <AverageRegistrations
                            fetchingStreams={loading}
                            averageRegistrations={averageRegistrations}
                            timeFrames={globalTimeFrame.timeFrames}
                            group={group}
                        />
                    </Grid>
                </Tooltip>
                <Tooltip arrow
                         title={
                             isUni ?
                                 `This block displays the total number of students from ${group.universityName} on CareerFairy.`
                                 : `This block displays the total number of individual users who registered or attended your events over the past ${globalTimeFrame.name}.`
                         }>
                    <Grid {...getCategoryProps()}>
                        <UserCount
                            fetching={loading}
                            totalUsers={getTotalUserDataSetCount()}
                            timeFrames={globalTimeFrame.timeFrames}
                            currentUserDataSet={currentUserDataSet}
                            group={group}
                        />
                    </Grid>
                </Tooltip>
                {(mediumScreen && !group.universityCode) &&
                <Tooltip arrow
                         title={`This block displays the total number of individual users who watched your events over the past ${globalTimeFrame.name}.`}>
                    <Grid item xs={12} md={12} sm={12}>
                        <TotalUniqueParticipatingStudents
                            fetchingStreams={loading}
                            totalUniqueParticipatingStudents={totalUniqueParticipatingStudents}
                            uniqueParticipationStatus={uniqueParticipationStatus}
                            timeFrames={globalTimeFrame.timeFrames}
                            globalTimeFrame={globalTimeFrame}
                            group={group}
                        />
                    </Grid>
                </Tooltip>
                }
                <Grid item lg={8} md={12} xl={9} xs={12}>
                    <LatestEvents
                        timeFrames={globalTimeFrame.timeFrames}
                        setCurrentStream={setCurrentStream}
                        fetchingStreams={loading}
                        currentStream={currentStream}
                        futureStreams={futureStreams}
                        streamsFromTimeFrame={streamsFromTimeFrame}
                        userType={userType}
                        userTypes={userTypes}
                        handleScrollToBreakdown={handleScrollToBreakdown}
                        handleToggleBar={handleToggleBar}
                        showBar={showBar}
                        setUserType={setUserType}
                        group={group}
                    />
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <Grid container spacing={3}>
                        {(!mediumScreen && !group.universityCode) &&
                        <Tooltip arrow
                                 title={`This block displays the total number of individual users who watched your events over the past ${globalTimeFrame.name}.`}>
                            <Grid xs={12} item>
                                <TotalUniqueParticipatingStudents
                                    fetchingStreams={loading}
                                    totalUniqueParticipatingStudents={totalUniqueParticipatingStudents}
                                    uniqueParticipationStatus={uniqueParticipationStatus}
                                    timeFrames={globalTimeFrame.timeFrames}
                                    globalTimeFrame={globalTimeFrame}
                                    group={group}
                                />
                            </Grid>
                        </Tooltip>}
                        <Grid xs={12} item>
                            <CategoryBreakdown
                                currentStream={currentStream}
                                breakdownRef={breakdownRef}
                                typesOfOptions={typesOfOptions}
                                localUserType={localUserType}
                                setLocalUserType={setLocalUserType}
                                userTypes={userTypes}
                                handleReset={handleReset}
                                setCurrentCategory={setCurrentCategory}
                                currentCategory={currentCategory}
                                setUserType={setUserType}
                                setCurrentStream={setCurrentStream}
                                group={group}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>

    );
};

export default General;
