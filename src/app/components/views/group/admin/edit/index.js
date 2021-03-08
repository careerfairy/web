import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";
import Profile from "./Profile";
import ProfileDetails from "./ProfileDetails";
import ProfileCategories from "./ProfileCategories";
import ProfilePrivacyPolicy from "./ProfilePrivacyPolicy";
import {withFirebase} from "../../../../../context/firebase";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

const EditOverview = ({firebase, group, isCompany}) => {

    const classes = useStyles()

    return (
        <Container className={classes.root} maxWidth="lg">
            <Grid
                container
                spacing={3}
            >
                <Grid
                    item
                    lg={4}
                    md={6}
                    xs={12}
                >
                    <Profile isCompany={isCompany}  firebase={firebase} group={group}/>
                </Grid>
                <Grid
                    item
                    lg={8}
                    md={6}
                    xs={12}
                >
                    <Grid spacing={3} container>
                        <Grid
                            item
                            lg={12}
                            md={12}
                            xs={12}
                        >
                            <ProfileDetails isCompany={isCompany} firebase={firebase} group={group}/>
                        </Grid>
                        <Grid
                            item
                            lg={12}
                            md={12}
                            xs={12}
                        >

                            <ProfileCategories isCompany={isCompany} firebase={firebase} group={group}/>
                        </Grid>
                        <Grid
                            item
                            lg={12}
                            md={12}
                            xs={12}
                        >

                            <ProfilePrivacyPolicy isCompany={isCompany} firebase={firebase} group={group}/>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        </Container>
    );
};

EditOverview.propTypes = {
  firebase: PropTypes.bool,
  group: PropTypes.object,
  isCompany: PropTypes.bool
}

export default withFirebase(EditOverview);

