import React, {useState} from 'react';
import {withFirebase} from 'context/firebase';
import {useRouter} from 'next/router';
import {AppBar, Box, Grid, Menu, MenuItem, Tab, Tabs} from "@material-ui/core";
import EnhancedGroupStreamCard from './enhanced-group-stream-card/EnhancedGroupStreamCard';
import {makeStyles} from "@material-ui/core/styles";
import useInfiniteScroll from "../../../../custom-hook/useInfiniteScroll";

const useStyles = makeStyles(theme => ({
    streamsWrapper: {
        overflowY: "hidden !important"
    },
    grid: {
        margin: 0,
        marginTop: 8,
        width: "100%"
    }
}))
const Events = (props) => {
    const classes = useStyles()
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState(null);

    const [value, setValue] = React.useState(0);

    const [itemsPast, loadMorePast, hasMorePast, totalItemsPast] = useInfiniteScroll(
        props.firebase.queryPastLiveStreamsByGroupId(props.group.id), 3
    );

    const [itemsUpcoming, loadMoreUpcoming, hasMoreUpcoming, totalItemsUpcoming] = useInfiniteScroll(
        props.firebase.queryUpcomingLiveStreamsByGroupId(props.group.id), 4
    );

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function TabPanel(props) {
        const {children, value, index, ...other} = props;

        return (
            value === index &&
            <Box>
                {children}
            </Box>
        );
    }

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    let livestreamElements = totalItemsUpcoming.map((livestream, index) => {
        return (
            <Grid key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={3} item>
                <div key={livestream.id} style={{position: "relative"}}>
                    <EnhancedGroupStreamCard key={livestream.id} livestream={livestream} {...props} fields={null}
                                             group={props.group} isPastLivestream={false}/>
                </div>
            </Grid>
        );
    });

    let pastLivestreamElements = totalItemsPast.map((livestream, index) => {
        return (
            <Grid key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={3} item>
                <div key={livestream.id} style={{position: "relative"}}>
                    <EnhancedGroupStreamCard key={livestream.id} livestream={livestream} {...props} fields={null}
                                             group={props.group} isPastLivestream={true}/>
                </div>
            </Grid>
        );
    });


    return (
        <div style={{width: '100%', textAlign: 'left', margin: '20px 0 20px 0'}}>
            <AppBar color='default' position="static">
                <Tabs
                    variant="fullWidth"
                    value={value}
                    onChange={handleChange}
                    indicatorColor='primary'
                    aria-label="nav tabs example"
                >
                    <Tab label="Next Live streams" {...a11yProps(0)}/>
                    <Tab label="Past Live streams" {...a11yProps(1)}/>
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                <Grid className={classes.grid} container spacing={2}>
                    {livestreamElements}
                </Grid>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Grid className={classes.grid} container spacing={2}>
                    {pastLivestreamElements}
                </Grid>
            </TabPanel>
            {/* <Button variant="contained"
                        color="primary"
                        size="medium"
                        style={{float: 'right', verticalAlign: 'middle', margin: '0'}}
                        onClick={handleClick}
                        endIcon={<AddIcon/>}>
                    New Live Stream
                </Button> */}
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => router.push('/group/' + props.group.id + '/admin/schedule-event')}>Send a
                    Company Request</MenuItem>
                <MenuItem onClick={handleClose}>Schedule a Live Stream</MenuItem>
            </Menu>
        </div>
    )
        ;
}

export default withFirebase(Events);