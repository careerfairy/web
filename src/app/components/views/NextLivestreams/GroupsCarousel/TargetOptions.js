import React from 'react';
import {Chip, Tooltip, Typography} from "@material-ui/core";

const TargetOptions = ({options}) => {

    const renderOptions = options.map(option => {
        return <Tooltip arrow
                        key={option.id}
                        style={{maxWidth: "inherit"}}
                        title={<Typography variant="body1">{option.name}</Typography>}
                        placement="top">
            <Chip
                variant="outlined"
                size="small"
                // style={{maxWidth: width}}
                label={option.name}/>
        </Tooltip>
    })
    return (
        <div>
            {renderOptions}
        </div>
    );
};

export default TargetOptions;
