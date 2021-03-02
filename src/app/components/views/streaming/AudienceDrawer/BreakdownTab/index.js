import React, {useMemo} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {useSelector} from "react-redux";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {Grid, Zoom} from "@material-ui/core";
import TalentPoolPercentage from "./TalentPoolPercentage";
import AudienceCategoryChart from "./AudienceCategoryChart";
import {isEmpty, isLoaded} from "react-redux-firebase";
import LoadingDisplay from "../displays/LoadingDisplay";
import EmptyDisplay from "../displays/EmptyDisplay";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(1)
    }
}));

const BreakdownTab = ({}) => {

    const classes = useStyles()
    const {currentLivestream: {talentPool, careerCenters}} = useCurrentStream()

    const handleMap = (arrayOfUsers) => {
        return arrayOfUsers.map(user => ({...user, inTalentPool: talentPool?.includes(user.id)}))
    }

    const audience = useSelector(({firestore: {ordered: {audience}}}) => audience && handleMap(audience))

    const talentPoolPercentage = useMemo(() => {
        const totalCount = audience.length
        const inTalentPoolCount = audience.filter(user => user.inTalentPool).length
        const percentage = (inTalentPoolCount / totalCount) * 100
        return isNaN(percentage) ? 0 : Math.round(percentage)
    }, [audience, talentPool])

    if (!isLoaded(audience)) {
        return <LoadingDisplay/>
    }
    if (isEmpty(audience)) {
        return <EmptyDisplay/>
    }

    return (
        <Grid container className={classes.root} spacing={1}>
            <Zoom in={Boolean(talentPool?.length)}>
                <Grid item xs={12}>
                    <TalentPoolPercentage percentage={talentPoolPercentage}/>
                </Grid>
            </Zoom>
            <Zoom mountOnEnter unmountOnExit in={Boolean(careerCenters?.length)}>
                <Grid item xs={12}>
                    <AudienceCategoryChart audience={audience}/>
                </Grid>
            </Zoom>
        </Grid>
    );
};

export default BreakdownTab;
