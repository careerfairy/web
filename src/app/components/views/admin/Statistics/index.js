import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Backdrop, CircularProgress, Container, Grid} from "@material-ui/core";
import FilterComponent from "./FilterComponent";
import {isLoaded, useFirestore} from "react-redux-firebase";
import Toolbar from "./Toolbar";
import {useDispatch, useSelector} from "react-redux";
import {convertArrayOfObjectsToDictionaryByProp} from "../../../../data/util/AnalyticsUtil";
import * as actions from '../../../../store/actions'
import AdminUsersTable from "./AdminUsersTable";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
        width: "100%"
    },
    backdrop:{
        zIndex: theme.zIndex.tooltip
    }
}));

const StatisticsOverview = () => {
    const dispatch = useDispatch()
    const classes = useStyles()
    const firestore = useFirestore()
    const filters = useSelector(state => state.currentFilterGroup.data.filters || [])
    const currentFilterGroupLoading = useSelector(state => state.currentFilterGroup.loading)
    const data = useSelector(state => state.firestore.data)

    const groupsLoaded = useSelector(({firestore: {data: {careerCenterData}}}) => isLoaded(careerCenterData))

    const loading = Boolean(currentFilterGroupLoading || !groupsLoaded)

    useEffect(() => {
        (async function getAllGroups() {
            await firestore.get({
                collection: "careerCenterData"
            })
        })()
    }, [])

    const handleQueryCurrentFilterGroup = async () => {
        try {
            dispatch(actions.setCurrentFilterGroupLoading())
            let groupIds = filters.map(({groupId}) => groupId) || []
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
            dispatch(actions.setCurrentFilterGroupFiltered())
            dispatch(actions.setTotalFilterGroupUsers(totalUsersMap))
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }

        dispatch(actions.setCurrentFilterGroupLoaded())
    }

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid component="form" container spacing={2}>
                <Grid item xs={12}>
                    <Toolbar loading={loading} queryDataSet={handleQueryCurrentFilterGroup}/>
                </Grid>
                <Grid item xs={12}>
                    <FilterComponent/>
                </Grid>
                <Grid item xs={12}>
                    {/*<AdminUsersTable/>*/}
                </Grid>
            </Grid>
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Container>
    );
};

export default StatisticsOverview;
