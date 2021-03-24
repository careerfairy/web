import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import AdminUsersTable from "./AdminUsersTable";
import {isLoaded, useFirestore} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {createSelector} from 'reselect'
import {universityCountriesMap} from "../../../util/constants";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
        width: "100%"
    }
}));

const usersSelector = createSelector(
    state => state.firestore.ordered.users,
    (users) => users.map(user => ({
        ...user,
        universityCountry: universityCountriesMap[user.universityCountryCode]
    }))

)
const UserTableOverview = ({}) => {

    const classes = useStyles()
    const firestore = useFirestore()
    const users = useSelector(state =>
        usersSelector(state)
    )
    // const users = useSelector(state => state.firestore.ordered.users?.map(user => ({...user})))
    console.log("-> users", users);
    useEffect(() => {
        if (!users) {
            (async function getAllUsers() {
                await firestore.get({
                    collection: "userData",
                    storeAs: "users"
                })
            })()
        }
    }, [])

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <AdminUsersTable loading={!isLoaded(users)} users={users}/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserTableOverview;
