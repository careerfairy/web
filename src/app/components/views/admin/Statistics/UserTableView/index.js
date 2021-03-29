import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import AdminUsersTable from "./AdminUsersTable";
import {useSelector} from "react-redux";
import {createSelector} from "reselect";

const useStyles = makeStyles(theme => ({
    root: {
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
    }
}));

const usersSelector = createSelector(
    state => state.currentFilterGroup.data,
    (_, {isFiltered}) => isFiltered,
    (currentFilterGroupData, isFiltered) => {
        return isFiltered ? currentFilterGroupData?.filteredStudentsData.ordered : currentFilterGroupData?.totalStudentsData.ordered
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
                    <AdminUsersTable isFiltered={isFiltered} users={users}/>
                </Grid>
            </Grid>
        </Container>
    );
};

UserTableView.propTypes = {
    isFiltered: PropTypes.bool
}

export default UserTableView;
