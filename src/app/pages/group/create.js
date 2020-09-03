import {useEffect, useState} from 'react'
import {Container} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../../data/firebase';
import Header from '../../components/views/header/Header';

import Head from 'next/head';
import Footer from '../../components/views/footer/Footer';
import CreateBaseGroup from "../../components/views/group/create/CreateBaseGroup";
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import CreateCategories from "../../components/views/group/create/CreateCategories";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    backButton: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

function getSteps() {
    return ['Create your base group', 'Setup your categories and sub-categories', 'Finish'];
}


const CreateGroup = (props) => {
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const [careerCenterRef, setCareerCenterRef] = useState("")
    const [baseGroupInfo, setBaseGroupInfo] = useState({})
    const [arrayOfCategories, setArrayOfCategories] = useState([])
    const steps = getSteps();

    const handleAddTempCategory = (categoryObj) => {
        // adds temporary categories locally
        setArrayOfCategories([...arrayOfCategories, categoryObj])
    }

    const handleUpdateCategory = (categoryObj) => {
        // updates the temporary categories locally
        const newCategories = [...arrayOfCategories]
        const indexOfOldObj = newCategories.findIndex(el => categoryObj.id === el.id)
        newCategories[indexOfOldObj] = categoryObj
        setArrayOfCategories(newCategories)
    }

    const handleDeleteLocalCategory = (categoryObjId) => {
        // deletes the temporary categories locally
        const newCategories = [...arrayOfCategories]
        const newerCategories = newCategories.filter(el => el.id !== categoryObjId)
        setArrayOfCategories(newerCategories)
    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setBaseGroupInfo({})
        setActiveStep(0);
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <CreateBaseGroup
                    setBaseGroupInfo={setBaseGroupInfo}
                    baseGroupInfo={baseGroupInfo}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    setCareerCenterRef={setCareerCenterRef}
                    handleReset={handleReset}
                    activeStep={activeStep}
                />;
            case 1:
                return <CreateCategories
                    handleDeleteLocalCategory={handleDeleteLocalCategory}
                    handleUpdateCategory={handleUpdateCategory}
                    handleAddTempCategory={handleAddTempCategory}
                    setArrayOfCategories={setArrayOfCategories}
                    arrayOfCategories={arrayOfCategories}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    handleReset={handleReset}
                    activeStep={activeStep}
                />;
            case 2:
                return <div><h1>Finished!</h1></div>
            default:
                return 'Unknown stepIndex';
        }
    }

    return (
        <div className='greyBackground'>
            <Head>
                <title key="title">CareerFairy | Create a group</title>
            </Head>
            <Header classElement='relative white-background'/>
            <Container textAlign='left'>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {getStepContent(activeStep)}
            </Container>
            <Footer/>
        </div>
    );
};

export default withFirebase(CreateGroup);