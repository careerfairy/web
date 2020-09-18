import React from 'react';
import {Box, Container} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import GroupStreams from "./GroupStreams";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: theme.spacing(0.5),
    },
    media: {
        display: "flex",
        justifyContent: "center",
        padding: "1.5em 1em 1em 1em",
        height: "90px",
    },
    image: {
        objectFit: "contain",
        maxWidth: "80%",
    }
}));

const DesktopFeed = ({groupData}) => {
    console.log("groupData in desk", groupData);
    const classes = useStyles()

    return (
        <Box display="flex" flexDirection="row">
            <div style={{backgroundColor: "pink", flex: 0.3, border: "1px solid pink", height: "80vh"}}/>
            <GroupStreams groupId={groupData.groupId}/>
        </Box>
    );
};

export default DesktopFeed;
