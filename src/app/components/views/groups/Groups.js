import React, {Fragment} from 'react';
import {Grow, Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import NewGroup from "../profile/NewGroup";
import {Slide} from 'react-reveal';

const Groups = ({groups, userData}) => {

    let moreGroupElements = [];

    moreGroupElements = groups.map(group => {
        return (
            <Grid item xs={12} sm={6} md={4} lg={4}>
                <Slide left appear={Boolean(group)} key={group.id}>
                    <NewGroup group={group} userData={userData}/>
                </Slide>
            </Grid>
        )
    });
    return (
        <Fragment>
            <Typography align="center" variant="h3" gutterBottom>Join A New Career Group</Typography>
            <Grid style={{marginBottom: 50}} container spacing={3}>
                {moreGroupElements}
            </Grid>
        </Fragment>
    );
};

export default Groups;
