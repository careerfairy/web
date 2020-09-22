import React, {Fragment, useEffect, useState} from 'react';
import {Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import NewGroup from "../profile/NewGroup";
import {Fade} from 'react-reveal';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

const Highlights = ({groups, handleSelectGroup}) => {
    return (
        <div style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            marginBottom: 10
        }}>
            <Autocomplete
                style={{MaxWidth: 300}}
                options={groups}
                selectOnFocus
                autoHighlight
                onChange={handleSelectGroup}
                getOptionLabel={(option) => option.universityName ? option.universityName : ""}
                renderInput={(params) => (
                    <TextField {...params} style={{backgroundColor: "white"}} placeholder="Join some groups"
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
            />
        </div>
    );
}


const Groups = ({groups, userData, makeSix}) => {
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
            <Typography align="center" variant="h3" gutterBottom>Join A New Career&nbsp;Group</Typography>
            <Highlights handleSelectGroup={handleSelectGroup}
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
