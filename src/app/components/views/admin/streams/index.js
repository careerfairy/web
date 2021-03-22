import PropTypes from 'prop-types'
import React, {Fragment, useMemo} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import Search from "./Search";
import StreamsContainer from "./StreamsContainer";


const useStyles = makeStyles((theme) => ({
    root: {
        height: "inherit",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        display: "flex",
        flexDirection: "column"
    },
    streamCard: {},
    highlighted: {}
}));

const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;

const AdminStreams = ({typeOfStream}) => {
    const classes = useStyles();

    const query = useMemo(() => [{
        collection: "livestreams",
        where: [["start", ">", new Date(Date.now() - fortyFiveMinutesInMilliseconds)], ["test", "==", false]],
        orderBy: ["start", "desc"],
        storeAs: "upcoming-livestreams"
    }], [typeOfStream])

    useFirestoreConnect(query)

    const streams = useSelector(state => state.firestore.ordered["upcoming-livestreams"])
    console.log("-> streams", streams);

    return (
        <Fragment>
            <Container className={classes.root} maxWidth={false}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Search/>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <StreamsContainer streams={streams}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Fragment>
    );
};


AdminStreams.propTypes = {
    typeOfStream: PropTypes.string
}

export default AdminStreams;

