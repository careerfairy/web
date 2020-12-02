import React, {Fragment, useState} from 'react';
import {withFirebase} from 'context/firebase';
import {useRouter} from 'next/router';
import {AppBar, Box, Grid, Menu, MenuItem, Tab, Tabs} from "@material-ui/core";
import EnhancedGroupStreamCard from './enhanced-group-stream-card/EnhancedGroupStreamCard';
import CustomInfiniteScroll from "../../../../util/CustomInfiteScroll";
import {makeStyles} from "@material-ui/core/styles";
import useInfiniteScroll from "../../../../custom-hook/useInfiniteScroll";
import {usePagination} from "use-pagination-firestore";

const useStyles = makeStyles(theme => ({
    streamsWrapper: {
        overflowY: "hidden !important"
    },
    grid: {
        margin: 0,
        width: "100%"
    }
}))
const Events = (props) => {
    const classes = useStyles()
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState(null);

    const [value, setValue] = React.useState(1);

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
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`nav-tabpanel-${index}`}
                aria-labelledby={`nav-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box p={3}>
                        {children}
                    </Box>
                )}
            </div>
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
            <Grid key={livestream.id} xs={12} sm={12} md={12} lg={12} item>
                <div key={livestream.id} style={{position: "relative"}}>
                    <EnhancedGroupStreamCard key={livestream.id} livestream={livestream} {...props} fields={null}
                                             group={props.group} isPastLivestream={false}/>
                </div>
            </Grid>
        );
    });

    let pastLivestreamElements = totalItemsPast.map((livestream, index) => {
        return (
            <Grid key={livestream.id} xs={12} sm={12} md={12} lg={12} item>
                <div key={livestream.id} style={{position: "relative"}}>
                    <EnhancedGroupStreamCard key={livestream.id} livestream={livestream} {...props} fields={null}
                                             group={props.group} isPastLivestream={true}/>
                </div>
            </Grid>
        );
    });


    return (
        <Fragment>
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
            <style jsx>{`
              .hidden {
                display: none;
              }

              .white-box {
                background-color: white;
                box-shadow: 0 0 5px rgb(190, 190, 190);
                border-radius: 5px;
                padding: 20px;
                margin: 10px;
                text-align: left;
              }

              .white-box-label {
                font-size: 0.8em;
                font-weight: 700;
                color: rgb(160, 160, 160);
                margin: 5px 0 5px 0;
              }

              .white-box-title {
                font-size: 1.2em;
                font-weight: 700;
                color: rgb(80, 80, 80);
              }

              .sublabel {
                text-align: left;
                display: inline-block;
                vertical-align: middle;
                margin: 9px 0;
                color: rgb(80, 80, 80);
              }
            `}</style>
        </Fragment>
    )
        ;
}

export default withFirebase(Events);