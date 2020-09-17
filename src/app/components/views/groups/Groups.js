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

    const [isBottom, setIsBottom] = useState(false);
    const [localGroups, setLocalGroups] = useState({
        page: 0,
        groupsToDisplay: []
    })

    const [selectedGroup, setSelectedGroup] = useState(null)

    useEffect(() => {
        if (groups) {
            const initialGroups = groups.slice(0, 10)
            setLocalGroups({
                ...localGroups,
                groupsToDisplay: initialGroups
            })
        }
    }, [groups])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isBottom) {
            addItems();
        }
    }, [isBottom]);



    const addItems = () => {
        if (groups.length !== 0) {
            setLocalGroups(prevState => ({
                page: prevState.page + 1,
                groupsToDisplay: prevState.groupsToDisplay.concat(
                    groups.slice(
                        (prevState.page + 1) * 10,
                        (prevState.page + 1) * 10 + 10,
                    ),
                ),
            }));
            setIsBottom(false);
        }
    };

    console.log("localGroups", localGroups)

    function handleScroll() {
        const scrollTop = (document.documentElement
            && document.documentElement.scrollTop)
            || document.body.scrollTop;
        const scrollHeight = (document.documentElement
            && document.documentElement.scrollHeight)
            || document.body.scrollHeight;
        if (scrollTop + window.innerHeight + 50 >= scrollHeight) {
            setIsBottom(true);
        }
    }


    const handleSelectGroup = (event, value) => {
        setSelectedGroup(value)
    }

    let moreGroupElements = [];

    moreGroupElements = localGroups.groupsToDisplay.map(group => {
        return (
            <Grid key={group.id} item xs={12} sm={6} md={makeSix || 4} lg={makeSix || 4}>
                <Fade ssrFadeout bottom duration={600}>
                    <NewGroup group={group} userData={userData}/>
                </Fade>
            </Grid>
        )
    });
    return (
        <Fragment>
            <Typography align="center" variant="h3" gutterBottom>Join A New Career&nbsp;Group</Typography>
            <Highlights handleSelectGroup={handleSelectGroup}
                        groups={groups}/>
            <Grid style={{marginBottom: makeSix ? 0 : 50}} container spacing={3}>
                {selectedGroup ?
                    <Grid item xs={12} sm={12} md={makeSix ? 12 : 4} lg={makeSix ? 12 : 4}>
                        <Fade ssrFadeout bottom duration={600}>
                            <NewGroup group={selectedGroup} userData={userData}/>
                        </Fade>
                    </Grid>
                    : moreGroupElements}
            </Grid>
        </Fragment>
    );
};

export default Groups;
