import React, {useEffect, useState} from 'react';
import {Box, Chip, Typography, Tooltip, TextField, IconButton} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import CancelSharpIcon from "@material-ui/icons/CancelSharp";
import {convertArrayOfObjectsToDictionaryByProp} from "../../../../data/util/AnalyticsUtil";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    inputWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "& .MuiTextField-root": {
            minWidth: 300,
            borderRadius: theme.spacing(2)

        }
    },
    root: {}
}));
const CategoryCard = ({category, handleToggleActive}) => {
    const classes = useStyles()
    const [optionsMap, setOptionsMap] = useState({});
    const [arrayOfOptionIds, setArrayOfOptionIds] = useState([]);

    useEffect(() => {
        if (category?.options?.length) {
            const newOptionsMap = convertArrayOfObjectsToDictionaryByProp(category.options, "id")
            setArrayOfOptionIds(category.options.map(({id}) => id))
            setOptionsMap(newOptionsMap)
        }
    }, [category?.options])

    return (
        <Autocomplete
            multiple
            options={arrayOfOptionIds}
            onChange={(e, value) => handleToggleActive(value, category.id)}
            getOptionLabel={(option) => optionsMap[option]?.name}
            className={classes.root}
            filterSelectedOptions
            renderInput={(params) => (
                <div className={classes.inputWrapper}>
                    <TextField
                        {...params}
                        label={category.name}
                        placeholder="Choose options"
                    />
                </div>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip variant="default"
                          label={optionsMap[option]?.name}
                          {...getTagProps({index})}
                    />
                ))
            }
        />
    )

    return (
        <>
            <Typography align="center" variant="h6">{category.name}</Typography>
            <Box display="flex" justifyContent="center" flexWrap="wrap">
                {renderOptions}
            </Box>
        </>
    );
};

export default CategoryCard;
