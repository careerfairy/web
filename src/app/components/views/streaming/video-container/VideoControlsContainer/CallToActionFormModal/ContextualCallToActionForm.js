import PropTypes from 'prop-types'
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({}));

const ContextualCallToActionForm = ({initialValues}) => {

  const classes = useStyles();

  return (
    <div>

    </div>
  );
};

ContextualCallToActionForm.propTypes = {
  initialValues: PropTypes.object.isRequired
}

export default ContextualCallToActionForm;

