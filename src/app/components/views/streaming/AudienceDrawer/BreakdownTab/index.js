import React, {useMemo} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {useSelector} from "react-redux";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {Grid} from "@material-ui/core";
import TalentPoolPercentage from "./TalentPoolPercentage";
import AudienceCategoryChart from "./AudienceCategoryChart";

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

    const audience = useSelector(({firestore: {ordered: {audience}}}) => audience && handleMap(audience) || [])

    const talentPoolPercentage = useMemo(() => {
        const totalCount = audience.length
        const inTalentPoolCount = audience.filter(user => user.inTalentPool).length
        const percentage = (inTalentPoolCount / totalCount) * 100
        return Math.round(percentage)
    }, [audience, talentPool])

    return (
        <Grid container className={classes.root} spacing={1}>
            <Grid item xs={12}>
                <TalentPoolPercentage percentage={talentPoolPercentage}/>
            </Grid>
            {careerCenters?.length &&
            <Grid item xs={12}>
                <AudienceCategoryChart audience={audience}/>
            </Grid>}
        </Grid>
    );
};

export default BreakdownTab;
