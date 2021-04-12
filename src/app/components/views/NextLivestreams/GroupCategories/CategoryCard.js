import React, {useEffect, useState} from 'react';
import {Chip, TextField} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
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
    const [value, setValue] = useState([]);

    useEffect(() => {
        handleSetActiveOptions()
        if (category?.options?.length) {
            const newOptionsMap = convertArrayOfObjectsToDictionaryByProp(category.options, "id")
            setArrayOfOptionIds(category.options.map(({id}) => id))
            setOptionsMap(newOptionsMap)
        }
    }, [category?.options])

    const handleSetActiveOptions = () => {
        const activeOptions = category?.options?.filter(option => option.active).map(option => option.id) || []
        setValue(activeOptions)
    }

    return (
        <Autocomplete
            multiple
            options={arrayOfOptionIds}
            value={value}
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
};

export default CategoryCard;
