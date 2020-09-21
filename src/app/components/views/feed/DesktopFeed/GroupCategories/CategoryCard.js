import React from 'react';
import {Box, Chip, Typography, Tooltip} from "@material-ui/core";

const CategoryCard = ({category, handleToggleActive, mobile}) => {

    const renderOptions = category.options.map(option => {
        return (
            <Tooltip arrow
                     key={option.id}
                     style={{maxWidth: "inherit"}}
                     title={<Typography variant="body1">{option.name}</Typography>}
                     placement="top">
                <Chip
                    color={option.active ? "primary" : "default"}
                    variant={option.active ? "default" : "outlined"}
                    style={{maxWidth: 300}}
                    label={option.name}
                    onClick={() => handleToggleActive(category.id, option.id)}/>
            </Tooltip>
        )
    })
    return (
        <div>
            <Typography variant="h6">{category.name}</Typography>
            <Box disyplay="flex" flexWrap="wrap">
                {renderOptions}
            </Box>
        </div>
    );
};

export default CategoryCard;
