import {Fragment} from 'react';
import {Button} from "@material-ui/core";

const CreateCategories = ({handleBack, handleNext, handleReset}) => {
    return (
        <Fragment>
            <Button
                color="secondary"
                variant="contained"
                onClick={handleBack}
            >Back</Button>

            <Button
                color="primary"
                variant="contained"
                onClick={handleNext}
            >Continue</Button>
        </Fragment>
    );
};

export default CreateCategories;
