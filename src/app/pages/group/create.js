import {useEffect, useState, Fragment} from 'react'
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
import CompletedGroup from "../../components/views/group/create/CompletedGroup";
// import {Container} from "@material-ui/core";

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


const CreateGroup = ({firebase}) => {
    const classes = useStyles();
    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [careerCenterRef, setCareerCenterRef] = useState("");
    const [baseGroupInfo, setBaseGroupInfo] = useState({});
    const [arrayOfCategories, setArrayOfCategories] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                router.replace('/login');
            }
        })
    }, []);

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

    const setServerLogoUrl = (serverUrl) => {
        setBaseGroupInfo({...baseGroupInfo, logoUrl: serverUrl})
    }

    function uploadLogo(fileObject) {
        var storageRef = firebase.getStorageRef();
        let fullPath = 'group-logos' + '/' + fileObject.name;
        let companyLogoRef = storageRef.child(fullPath);

        var uploadTask = companyLogoRef.put(fileObject);

        uploadTask.on('state_changed',
            function (snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                    default:
                        break;
                }
            }, function (error) {
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;

                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                    default:
                        break;
                }
            }, function () {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    setServerLogoUrl(downloadURL);
                    console.log('File available at', downloadURL);
                    const careerCenter = {
                        universityName: baseGroupInfo.universityName,
                        adminEmail: user.email,
                        logoUrl: baseGroupInfo.logoUrl,
                        description: baseGroupInfo.description,
                        test: false,
                    }
                    firebase.createCareerCenter(careerCenter).then(careerCenterRef => {
                        setCareerCenterRef(careerCenterRef)
                        console.log("career center has been asaved in state!", careerCenterRef)
                        return firebase.addMultipleGroupCategoryWithElements(careerCenterRef.id, arrayOfCategories)
                        // router.push('/group/' + careerCenterRef.id + '/admin');
                    });
                });
            });
    }

    const createCareerCenter = () => {
        uploadLogo(baseGroupInfo.logoFileObj)
    }

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
                    createCareerCenter={createCareerCenter}
                />;
            case 2:
                return <CompletedGroup
                    baseGroupInfo={baseGroupInfo}
                    careerCenterRef={careerCenterRef}/>
            default:
                return 'Unknown stepIndex';
        }
    }

    return (
        <Fragment>
            <div className='greyBackground'>
                <Head>
                    <title key="title">CareerFairy | Create a group</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container textAlign='left'>
                    <Stepper style={{backgroundColor: '#FAFAFA'}} activeStep={activeStep} alternativeLabel>
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
            <style jsx>{`
                .content-wrapper {
                  background-color: black;
                }
          `}</style>
        </Fragment>
    );
};

export default withFirebase(CreateGroup);