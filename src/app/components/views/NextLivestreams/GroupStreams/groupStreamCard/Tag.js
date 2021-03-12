import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Chip, Tooltip, Typography} from "@material-ui/core";

const useStyles = makeStyles(theme => ({}));

const Tag = ({option}) => {

    const classes = useStyles()

    return (
        <div>
            <Tooltip arrow
                     key={option.id}
                     style={{maxWidth: "inherit"}}
                     title={<Typography align="center" variant="body1">{option.name}</Typography>}
                     placement="top">
                <Chip
                    size="small"
                    variant="outlined"
                    style={{maxWidth: 300, color: "white", borderColor: "white"}}
                    label={<Typography variant="body1" noWrap>{option.name}</Typography>}/>
            </Tooltip>
        </div>
    );
};

Tag.propTypes = {
    option: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired
}

export default Tag;

