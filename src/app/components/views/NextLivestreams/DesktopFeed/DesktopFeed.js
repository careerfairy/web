import React from 'react';
import {Container, Grid, Grow, withWidth} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";
import {useTheme} from "@material-ui/core/styles";

const DesktopFeed = ({
                         groupData,
                         hasCategories,
                         handleToggleActive,
                         mobile,
                         livestreams,
                         searching,
                         livestreamId,
                         careerCenterId,
                         listenToUpcoming,
                         selectedOptions,
                         isPastLivestreams,
                     }) => {
    const theme = useTheme()
    return (
        <Grow in>
            <Container maxWidth="lg" disableGutters style={{flex: 1, display: "flex"}}>
                <Grid
                    container
                    spacing={4}
                    style={{margin: theme.spacing(1)}}
                >
                    <GroupCategories
                        mobile={mobile}
                        hasCategories={hasCategories}
                        handleToggleActive={handleToggleActive}
                        groupData={groupData}
                    />
                    <GroupStreams
                        mobile={false}
                        isPastLivestreams={isPastLivestreams}
                        livestreamId={livestreamId}
                        listenToUpcoming={listenToUpcoming}
                        careerCenterId={careerCenterId}
                        selectedOptions={selectedOptions}
                        searching={searching}
                        livestreams={livestreams}
                        groupData={groupData}
                    />
                </Grid>
            </Container>
        </Grow>
    );
};

export default withWidth()(DesktopFeed);
