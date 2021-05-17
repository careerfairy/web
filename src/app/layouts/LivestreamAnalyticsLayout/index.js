import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import TopBar from "./TopBar";
import {useFirestoreConnect} from "react-redux-firebase";
import {useRouter} from "next/router";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        width: '100%'
    },
    content: {
        flex: '1 1 auto',
        height: '100%',
        overflow: 'auto'
    }
}));

const populates = [
    {child: 'groupIds', root: 'careerCenterData', childAlias: 'groups'},
]


const LivestreamAnalyticsLayout = ({}) => {

    const classes = useStyles()
    const {query:{livestreamId}} = useRouter()
    useFirestoreConnect(() => [
        {
            collection: "livestreams",
            doc: livestreamId,
            storeAs: "currentLivestream"
        }
    ])

    const currentLivestream = useSelector(({firestore:{data}}) => data.currentLivestream )

    return (
        <div className={classes.root}>
        <TopBar/>
            <div className={classes.content}>
                {/*{(isLoaded(group) && !isEmpty(group)) && React.Children.map(children, child => React.cloneElement(child, {*/}
                {/*    notifications,*/}
                {/*    isAdmin: isAdmin(),*/}
                {/*    group, ...props*/}
                {/*}))}*/}
                {/*{(isLoaded(group) && !isEmpty(group)) && React.cloneElement(children, {*/}
                {/*    notifications,*/}
                {/*    isAdmin: isAdmin(),*/}
                {/*    group, ...props*/}
                {/*})}*/}
            </div>
        </div>
    );
};

export default LivestreamAnalyticsLayout;
