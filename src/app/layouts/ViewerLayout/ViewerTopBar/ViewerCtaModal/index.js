import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";

const useStyles = makeStyles(theme => ({}));

const ViewerCtaModal = ({}) => {
  const open = useSelector(state => state.stream.layout.viewerCtaModalOpen)
  console.log("-> open", open);

  const classes = useStyles();

  return (
    <div>

    </div>
  );
};

export default ViewerCtaModal;
