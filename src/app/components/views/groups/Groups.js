import React, {Fragment, useEffect, useState} from 'react';
import { Button, Typography, Grid, TextField } from "@material-ui/core";
import NewGroup from "../profile/NewGroup";
import {Fade} from 'react-reveal';
import Autocomplete from '@material-ui/lab/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import Link from "next/link";

const Highlights = ({groups, handleSelectGroup, absolutePath}) => {
    return (
        <div style={{
            position: "sticky",
            top: 10,
            zIndex: 10,
            marginBottom: 10,
            display: "flex",
        }}>
            <Autocomplete
                options={groups}
                selectOnFocus
                fullWidth
                autoHighlight
                onChange={handleSelectGroup}
                getOptionLabel={(option) => option.universityName ? option.universityName : ""}
                renderInput={(params) => (
                    <TextField {...params} style={{backgroundColor: "white",margin: 0}} placeholder="Join some groups"
                               label="Search" fullWidth variant="outlined"
                               margin="normal"/>
                )}
                renderOption={(option, {inputValue}) => {
                    const matches = match(option.universityName, inputValue);
                    const parts = parse(option.universityName, matches);

                    return (
                        <div>
                            {parts.map((part, index) => (
                                <span key={index} style={{fontWeight: part.highlight ? 700 : 400}}>
                {part.text}
              </span>
                            ))}
                        </div>
                    );
                }}
            >
            </Autocomplete>
            {absolutePath ? null :<Link href='/next-livestreams'>
                <a>
                    <Button style={{marginLeft: "0.5rem"}} disableElevation color="primary" variant="contained">
                        To next livestreams
                    </Button>
                </a>
            </Link>}
        </div>
    );
}


const Groups = ({groups, userData, makeSix, absolutePath}) => {
    const [selectedGroup, setSelectedGroup] = useState(null)

    const handleSelectGroup = (event, value) => {
        setSelectedGroup(value)
    }

    let moreGroupElements = [];

    moreGroupElements = groups.map(group => {
        return (
            <NewGroup makeSix={makeSix} key={group.id} group={group} userData={userData}/>
        )
    });
    return (
        <Fragment>
            <Typography align="center" variant="h3" gutterBottom>Follow More Career&nbsp;Groups</Typography>
            <Highlights handleSelectGroup={handleSelectGroup}
                        absolutePath={absolutePath}
                        groups={groups}/>
            <Grid style={{marginBottom: makeSix ? 0 : 50}} container spacing={3}>
                {selectedGroup ?
                    <NewGroup selected={true} makeSix={makeSix} group={selectedGroup} userData={userData}/>
                    : moreGroupElements}
            </Grid>
        </Fragment>
    );
};

export default Groups;
