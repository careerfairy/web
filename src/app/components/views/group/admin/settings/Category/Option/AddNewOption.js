import React, { Fragment, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";

const AddNewOption = ({ updateMode, handleAdd, setUpdateMode, open }) => {
  if (!updateMode.mode) {
    return null;
  }
  const [newOptionName, setNewOptionName] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!newOptionName.length) {
      setError("Please fill this field");
    }
  }, [touched, newOptionName.length]);

  useEffect(() => {
    if (
      newOptionName.length &&
      updateMode.options.some((el) => el.name === newOptionName)
    ) {
      setError("Cannot be a duplicate");
      setTouched(true);
    } else {
      setError(false);
    }
  }, [newOptionName]);

  const handleAddModal = (e) => {
    e.preventDefault();
    if (!newOptionName.length) {
      setTouched(true);
      return setError("Please fill this field");
    }
    if (error) return;
    const tempId = uuidv4();
    handleAdd({ name: newOptionName, id: tempId });
    setUpdateMode({});
  };

  return (
    <Fragment>
      <Dialog open={open} onClose={setUpdateMode({})}>
        <form onSubmit={handleAddModal}>
          <div
            style={{
              fontSize: "1.1em",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <DialogTitle>Add an option named:</DialogTitle>
            <TextField
              autoFocus
              variant="outlined"
              maxLength="20"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              error={Boolean(touched && error.length > 0)}
              onBlur={() => setTouched(true)}
              helperText={touched && error}
              style={{ width: "30%", margin: "0 20px 0 0", height: 60 }}
              name="option-name"
            />
          </div>
          <div style={{ margin: "20px 0 0 0" }}>
            <Button
              style={{ marginRight: 10 }}
              variant="contained"
              type="submit"
              color="primary"
            >
              Confirm
            </Button>
            <Button variant="contained" onClick={() => setUpdateMode({})}>
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
      {/*<div className={updateMode.mode ? 'modal' : ''}/>*/}
      {/*<div className='padding animated fadeIn'>*/}

      {/*</div>*/}
    </Fragment>
  );
};

export default AddNewOption;
