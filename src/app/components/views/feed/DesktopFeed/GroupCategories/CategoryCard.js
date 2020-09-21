import React from 'react';
import {Box, Chip, Typography} from "@material-ui/core";

const CategoryCard = ({category, handleToggleActive}) => {

    const renderOptions = category.options.map(option => {
        return(
            <Chip
                key={option.id}
                variant="outlined"
                label={option.name}
                onClick={()=> handleToggleActive(category.id, option.id)}/>
        )
    })
    return (
        <div>
            <Typography>{category.name}</Typography>
            <Box disyplay="flex" flexWrap="wrap">
                {renderOptions}
            </Box>
        </div>
    );
};

export default CategoryCard;
