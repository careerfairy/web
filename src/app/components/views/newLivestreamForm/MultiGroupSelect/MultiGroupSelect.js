import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {TextField} from '@material-ui/core'


const MultiGroupSelect = ({value, values, groups, handleBlur, handleChange}) => {
    console.log("-> values", values);
    return groups.length ? (
        <Autocomplete
            id="groupIds"
            name="groupIds"
            multiple
            options={groups}
            onBlur={handleBlur}
            value={value}
            onChange={handleChange}
            getOptionLabel={(option) => option.universityName}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Add some Universities" placeholder="Favorites"/>
            )}
        />
    ) : null;
};

export default MultiGroupSelect;
