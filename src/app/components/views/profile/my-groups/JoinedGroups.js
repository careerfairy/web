import React from 'react'
import {Button, Grid, Typography} from "@material-ui/core";
import {useRouter} from 'next/router';
import {withFirebase} from 'data/firebase';
import AddIcon from '@material-ui/icons/Add';
import CurrentGroup from 'components/views/profile/CurrentGroup';
import {makeStyles} from "@material-ui/core/styles";

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

const JoinedGroups = ({userData}) => {

    const router = useRouter();
    const classes = useStyles()

    let existingGroupElements = [];

    if (userData && userData.groupIds) {
        existingGroupElements = userData.groupIds.map(groupId => {
            return <CurrentGroup key={groupId} groupId={groupId} userData={userData}/>
        });
    }


    return (
        <div>
            <div className={classes.header}>
                <Typography className={classes.title}
                            variant="h5">
                    My Groups
                </Typography>
                <Button endIcon={<AddIcon/>}
                        variant="contained"
                        style={{position: 'sticky'}}
                        color="primary"
                        onClick={() => router.push('/groups')}>
                    Follow More Groups
                </Button>
            </div>
            {existingGroupElements.length ?
                <Grid style={{marginBottom: 50}} container spacing={3}>
                    {existingGroupElements}
                </Grid>
                :
                <Typography gutterBottom>
                    You are currently not a member of any career group.
                </Typography>}
        </div>
    );
};

export default withFirebase(JoinedGroups);