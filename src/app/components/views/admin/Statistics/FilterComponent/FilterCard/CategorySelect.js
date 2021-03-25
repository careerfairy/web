import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({}));

const CategorySelect = ({option, groupCategories}) => {
    const classes = useStyles()

    return (
        <div>
            
        </div>
    );
};

CategorySelect.propTypes = {
  option: PropTypes.shape({
      category: PropTypes.string,
      targetOptions: PropTypes.arrayOf(PropTypes.string),
      categoryData: PropTypes.arrayOf(PropTypes.shape({

      })).isRequired
  }).isRequired,
}
export default CategorySelect;

