import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import AdminUsersTable from "./AdminUsersTable";
import {useSelector} from "react-redux";
import {createSelector} from "reselect";
import {universityCountriesMap} from "../../../../util/constants";

const useStyles = makeStyles(theme => ({
    root: {
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
    }
}));

const usersSelector = createSelector(
    state => state.currentFilterGroup,
    (_, {isFiltered}) => isFiltered,
    (currentFilterGroup, isFiltered) => {
        let users = isFiltered ? currentFilterGroup?.filteredStudentsData.ordered : currentFilterGroup?.totalStudentsData.ordered
        return users?.map(user => ({
            ...user,
            universityCountry: universityCountriesMap[user.universityCountryCode]
        })) || []
    }
)


const UserTableView = ({isFiltered}) => {

    const classes = useStyles()
    const users = useSelector(state =>
        usersSelector(state, {isFiltered})
    )

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <AdminUsersTable users={users}/>
                </Grid>
            </Grid>
        </Container>
    );
};

UserTableView.propTypes = {
    isFiltered: PropTypes.bool
}

export default UserTableView;
