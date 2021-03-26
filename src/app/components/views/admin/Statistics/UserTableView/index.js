import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import AdminUsersTable from "./AdminUsersTable";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({
    root: {
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
    }
}));

const UserTableView = ({isFiltered}) => {

    const classes = useStyles()
    const users = useSelector(({
                                   currentFilterGroup: {
                                       totalStudentsData,
                                       filteredStudentsData
                                   }
                               }) => isFiltered ? filteredStudentsData.ordered : totalStudentsData.ordered || [])

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
