import PropTypes from 'prop-types'
import React, {useState} from 'react';
import {alpha, makeStyles} from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import {InputAdornment, InputBase, TextField} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },

        marginRight: theme.spacing(1),

        [theme.breakpoints.down('sm')]: {
            marginLeft: "auto",
        },
    },
    searchIcon: {
        fontSize: theme.typography.h1.fontSize,
    },
    inputRoot: {
        color: 'inherit',
        fontSize: theme.typography.h1.fontSize,
    },
    inputInput: {
        transition: theme.transitions.create('width'),
        width: '100%',
        padding: theme.spacing(1, 1, 1, 1),
    },
}));

const GeneralSearch = () => {

    const classes = useStyles()

    const [searchParams, setSearchParams] = useState("");
    const handleChange = (event) => {
        setSearchParams(event.target.value)
    }

    const handleSubmitSearch = () => {
    }

    return (
        <TextField
            placeholder="Search…"
            fullWidth
            className={classes.root}
            onChange={handleChange}
            value={searchParams}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon color="inherit" className={classes.searchIcon}/>
                    </InputAdornment>
                ),
                'aria-label': 'search',
                classes: {
                    root: classes.inputRoot,
                    input: classes.inputInput,
                },
                className: classes.search
            }}
        />
    )
};

export default GeneralSearch;
