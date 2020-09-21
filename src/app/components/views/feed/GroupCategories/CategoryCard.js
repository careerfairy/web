import React from 'react';
import {Box, Chip, Typography, Tooltip} from "@material-ui/core";
import {useWindowSize} from "../../../custom-hook/useWindowSize";

const CategoryCard = ({category, handleToggleActive, mobile, width}) => {
    console.log("width", width);

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
                    size={mobile ? "small" : "medium"}
                    style={{maxWidth: width}}
                    label={option.name}
                    onClick={() => handleToggleActive(category.id, option.id)}/>
            </Tooltip>
        )
    })
    return (
        <>
            <Typography variant="h6">{category.name}</Typography>
            <Box disyplay="flex" flexWrap="wrap">
                {renderOptions}
            </Box>
        </>
    );
};

export default CategoryCard;
