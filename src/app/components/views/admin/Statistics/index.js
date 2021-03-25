import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import FilterComponent from "./FilterComponent";
import {useFirestore} from "react-redux-firebase";
import Toolbar from "./Toolbar";
import {useDispatch, useSelector} from "react-redux";
import {convertArrayOfObjectsToDictionaryByProp} from "../../../../data/util/AnalyticsUtil";
import * as actions from '../../../../store/actions'

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
        width: "100%"
    }
}));

const StatisticsOverview = (props) => {
    const dispatch = useDispatch()
    const classes = useStyles()
    const firestore = useFirestore()
    const currentFilterGroup = useSelector(state => state.currentFilterGroup)
    const ordered = useSelector(state => state.firestore.ordered)
    const data = useSelector(state => state.firestore.data)
    console.log("-> data", data);
    useEffect(() => {
        (async function getAllGroups() {
            await firestore.get({
                collection: "careerCenterData"
            })
        })()
    }, [])

    const handleQueryCurrentFilterGroup = async (e) => {
        e.preventDefault?.()
        try {
            dispatch(actions.setCurrentFilterGroupLoading())
            const groupIds = currentFilterGroup.data.filters.map(({groupId}) => groupId) || []
            let totalUsersMap = {}

            for (const groupId of groupIds) {
                let groupFollowersMap = data[`followers of ${groupId}`]
                if (!groupFollowersMap) {
                    const userSnaps = await firestore.get({
                        collection: "userData",
                        where: ["groupIds", "array-contains", groupId],
                        storeAs: `followers of ${groupId}`
                    })
                    const arrayOfUserData = userSnaps.docs.map(doc => ({id: doc.id, ...doc.data()}))
                    groupFollowersMap = convertArrayOfObjectsToDictionaryByProp(arrayOfUserData, "id")
                }
                totalUsersMap = Object.assign(totalUsersMap, (groupFollowersMap || {}))
            }
            console.log("-> totalUsersMap", totalUsersMap);
            console.log("-> length", Object.keys(totalUsersMap).length);
            alert("hi")
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }

        dispatch(actions.setCurrentFilterGroupLoaded())
    }
    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid onSubmit={handleQueryCurrentFilterGroup} component="form" container spacing={2}>
                <Grid item xs={12}>
                    <Toolbar handleQueryCurrentFilterGroup={handleQueryCurrentFilterGroup}/>
                </Grid>
                <Grid item xs={12}>
                    <FilterComponent/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StatisticsOverview;
