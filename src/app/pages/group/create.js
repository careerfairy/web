import {useEffect, useState, Fragment, useContext} from 'react'
import Head from 'next/head';
import {Container} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../../context/firebase';
import Header from '../../components/views/header/Header';
import Footer from '../../components/views/footer/Footer';
import CreateBaseGroup from "../../components/views/group/create/CreateBaseGroup";
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import CreateCategories from "../../components/views/group/create/CreateCategories";
import CompleteGroup from "../../components/views/group/create/CompleteGroup";
import {GlobalBackground} from "../../materialUI/GlobalBackground/GlobalBackGround";
import UserContext from "../../context/user/UserContext";
import Loader from "../../components/views/loader/Loader";

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
    const {userData, authenticatedUser: user, loading} = useContext(UserContext);
    const [activeStep, setActiveStep] = useState(0);
    const [baseGroupInfo, setBaseGroupInfo] = useState({});
    const [arrayOfCategories, setArrayOfCategories] = useState([]);

    const router = useRouter();

    useEffect(() => {
        if (user === null) {
            router.replace("/login");
        }
    }, [user]);


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

    const uploadLogo = async (fileObject) => {
        try {
            var storageRef = firebase.getStorageRef();
            let fullPath = 'group-logos' + '/' + fileObject.name;
            let companyLogoRef = storageRef.child(fullPath);
            var uploadTask = companyLogoRef.put(fileObject);
            const snapshot = await uploadTask.then()
            return snapshot.ref.getDownloadURL()

        } catch (e) {
            console.log("error in async", e)
        }

    }

    const createCareerCenter = async () => {
        try {
            const downloadURL = await uploadLogo(baseGroupInfo.logoFileObj)
            const careerCenter = {
                universityName: baseGroupInfo.universityName,
                adminEmail: user.email,
                logoUrl: downloadURL,
                description: baseGroupInfo.description,
                test: false,
                categories: arrayOfCategories
            }
            let ref = await firebase.createCareerCenter(careerCenter);
            firebase.updateCareerCenter(ref.id, {groupId: ref.id}).then(() => {
                router.push(`/group/${ref.id}/admin`)
            })

            // const careerCenterId = careerCenterRef.id
            // await firebase.addMultipleGroupCategoryWithElements(careerCenterRef.id, arrayOfCategories)
            // return careerCenterId

        } catch (e) {
            console.log("error in async 2", e);

        }
    }

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <CreateBaseGroup
                    setBaseGroupInfo={setBaseGroupInfo}
                    baseGroupInfo={baseGroupInfo}
                    handleNext={handleNext}
                    handleBack={handleBack}
                />;
            case 1:
                return <CreateCategories
                    handleDeleteLocalCategory={handleDeleteLocalCategory}
                    handleUpdateCategory={handleUpdateCategory}
                    handleAddTempCategory={handleAddTempCategory}
                    arrayOfCategories={arrayOfCategories}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    handleReset={handleReset}
                    activeStep={activeStep}
                />;
            case 2:
                return <CompleteGroup
                    createCareerCenter={createCareerCenter}
                    baseGroupInfo={baseGroupInfo}
                    setActiveStep={setActiveStep}
                    handleBack={handleBack}
                    arrayOfCategories={arrayOfCategories}/>
            default:
                return 'Unknown stepIndex';
        }
    }

    if (user === null || userData === null || loading === true) {
        return <Loader/>;
    }

    return (
        <GlobalBackground>
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
        </GlobalBackground>
    );
};

export default withFirebase(CreateGroup);