import React, {useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid, Typography} from "@material-ui/core";
import MembersTable from "./MembersTables";
import {useSelector} from "react-redux";
import {useFirestoreConnect} from "react-redux-firebase";
import AddMemberModal from "./AddMemberModal";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

const RolesOverview = ({firebase, group}) => {

    const classes = useStyles()
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const openAddMemberModal = () => {
        setShowAddMemberModal(true)
    }
    const closeAddMemberModal = () => {
        setShowAddMemberModal(false)
    }

    return (
        <Container className={classes.root} maxWidth="lg">
            <Typography variant="h1">
                Roles
            </Typography>
            <Grid
                container
                spacing={3}
            >
                <Grid item xs={12} sm={12}>
                    <MembersTable
                        openAddMemberModal={openAddMemberModal}
                        group={group}
                    />
                </Grid>
            </Grid>
            <AddMemberModal
                group={group}
                open={showAddMemberModal}
                onClose={closeAddMemberModal}
            />
        </Container>
    );
};

export default RolesOverview;
