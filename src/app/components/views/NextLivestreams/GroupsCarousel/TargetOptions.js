import React from 'react';
import {Chip, Tooltip, Typography} from "@material-ui/core";

const TargetOptions = ({options}) => {

    const renderOptions = options.map(option => {
        return <Tooltip arrow
                        key={option.id}
                        style={{maxWidth: "inherit"}}
                        title={<Typography align="center" variant="body1">{option.name}</Typography>}
                        placement="top">
            <Chip
                variant="outlined"
                size="small"
                style={{maxWidth: 300, background: "rgba(255,255,255, 0.5)"}}
                // style={{maxWidth: width}}
                label={<Typography variant="body1" noWrap>{option.name}</Typography>}/>
        </Tooltip>
    })
    return (
        <div>
            {renderOptions}
        </div>
    );
};

export default TargetOptions;
