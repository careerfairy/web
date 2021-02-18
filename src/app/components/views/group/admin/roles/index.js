import React, {useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid, Typography} from "@material-ui/core";
import MembersTable from "./MembersTables";
import {useSelector} from "react-redux";
import {useFirestoreConnect} from "react-redux-firebase";
import AddMemberModal from "./AddMemberModal";
import {useSnackbar} from "notistack";
import {GENERAL_ERROR} from "../../../../util/constants";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

const RolesOverview = ({firebase, group}) => {
    const {enqueueSnackbar} = useSnackbar()
    const classes = useStyles()
    const [kicking, setKicking] = useState(false);
    const userRole = useSelector(({firestore}) => firestore.data.userRole || {})

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const openAddMemberModal = () => {
        setShowAddMemberModal(true)
    }
    const closeAddMemberModal = () => {
        setShowAddMemberModal(false)
    }

    const handleKickAdmin = async (adminRole) => {
        try {
            if (adminRole === "mainAdmin" || userRole.role !== "mainAdmin") {
                enqueueSnackbar("You cannot kick a head admin or you do not have permission", {
                    variant: "warning",
                    preventDuplicate: true
                })

            } else {
                setKicking(true)
                await firebase.kickFromDashboard(group.id, adminRole.id)
                enqueueSnackbar(`${adminRole.id} has been successfully kicked from the dashboard`, {
                    variant: "info",
                    preventDuplicate: true
                })
            }
        } catch (e) {
            console.error("-> error", e);
            enqueueSnackbar(GENERAL_ERROR, {
                variant: "error",
                preventDuplicate: true
            })
        }
        setKicking(false)
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
                        handleKickAdmin={handleKickAdmin}
                        kicking={kicking}
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
