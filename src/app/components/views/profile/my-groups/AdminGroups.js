import React, {useEffect, useState, Fragment} from 'react'
import {Button, Grid, Typography} from "@material-ui/core";
import {withFirebase} from 'data/firebase';
import CurrentGroup from 'components/views/profile/CurrentGroup';
import {makeStyles} from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import {useRouter} from "next/router";


const useStyles = makeStyles((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },
    title: {
        color: 'rgb(160,160,160)',
        margin: '0 0 10px 0',
        fontWeight: '300'
    }
}));

const AdminGroups = ({userData, firebase}) => {
    const router = useRouter()
    const classes = useStyles()
    const [adminGroups, setAdminGroups] = useState([]);

    useEffect(() => {
        if (userData) {
            firebase.listenCareerCentersByAdminEmail(userData.id, querySnapshot => {
                let careerCenters = [];
                querySnapshot.forEach(doc => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    careerCenters.push(careerCenter);
                })
                setAdminGroups(careerCenters);
            })
        }
    }, [userData])

    let adminGroupElements = [];

    if (userData) {
        adminGroupElements = adminGroups.map(group => {
            return (
                <Fragment key={group.id}>
                    <Grid item xs={12} sm={6} md={6} lg={6} xl={4}>
                        <CurrentGroup isAdmin={true} group={group} userData={userData}/>
                    </Grid>
                </Fragment>
            )
        });
    }

    return (
        <Fragment>
            <div>
                <div className={classes.header}>
                    <Typography className={classes.title} variant="h5">
                        Admin Groups
                    </Typography>
                    <Button endIcon={<AddIcon/>}
                        variant="contained"
                        color="primary"
                        onClick={() => router.push('/group/create')}>
                    Create a group
                </Button>
                </div>
                {adminGroupElements.length ?
                    <Grid style={{marginBottom: 50}} container spacing={3}>
                        {adminGroupElements}
                    </Grid>
                    :
                    <Typography gutterBottom>
                        You are currently not a member of any career group.
                    </Typography>}
            </div>
        </Fragment>
    );
};

export default withFirebase(AdminGroups);