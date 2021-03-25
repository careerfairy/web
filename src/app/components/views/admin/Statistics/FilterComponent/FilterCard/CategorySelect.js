import PropTypes from 'prop-types'
import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Chip, TextField} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import {convertArrayOfObjectsToDictionaryByProp} from "../../../../../../data/util/AnalyticsUtil";

const useStyles = makeStyles(theme => ({}));

const CategorySelect = ({option}) => {
    const classes = useStyles()
    const {data: {options, name}, categoryId, targetOptionIds} = option
    const [optionsMap, setOptionsMap] = useState({});

    useEffect(() => {
        if (options?.length) {
            const newOptionsMap = convertArrayOfObjectsToDictionaryByProp(options, "id")
            setOptionsMap(newOptionsMap)
        }
    }, [options])

    const handleChange = () => {

    }

    return (
        <Autocomplete
            multiple
            id="tags-outlined"
            options={options}
            value={targetOptionIds}
            onChange={handleChange}
            getOptionLabel={(option) => option.name}
            disableClearable
            defaultValue={targetOptionIds}
            filterSelectedOptions
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={name}
                    placeholder="Choose options"
                />
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip variant="default"
                          label={optionsMap[option]?.name}
                          {...getTagProps({index})}
                        // onDelete={() => handleClickDelete(option)}
                    />
                ))
            }
        />
    );
};

CategorySelect.propTypes = {
    option: PropTypes.shape({
        categoryId: PropTypes.string,
        targetOptionIds: PropTypes.arrayOf(PropTypes.string),
        data: PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            options: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string,
                name: PropTypes.string
            })).isRequired
        }).isRequired
    }).isRequired,
}
export default CategorySelect;

