import React, {Fragment, useState} from 'react'
import {Button, Container, Typography} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';

import DisplayCategoryElement from "./DisplayCategoryElement";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {useRouter} from "next/router";


const CompleteGroup = ({ handleBack, baseGroupInfo, createCareerCenter, arrayOfCategories, setActiveStep}) => {
    const [submitting, setSubmitting] = useState(false)
    const {push} = useRouter()

    const handleFinalize = async () => {
        setSubmitting(true)
        const ID = await createCareerCenter()
        setSubmitting(false)
        push(`/group/${ID}/admin`)
    }

    const categories = arrayOfCategories.map((category, index) => {
        return (
            <DisplayCategoryElement setActiveStep={setActiveStep} key={index} category={category}/>
        )
    })

    return (
        <Fragment>
            <Container>
                <h1 className='content-title'>Last Check</h1>
                <div>
                    <Typography variant="h2" gutterBottom>
                        Have one last look before you finalze
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Group Name: <strong>{baseGroupInfo.universityName}</strong>
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        About:
                    </Typography>
                    <Typography paragraph>
                        {baseGroupInfo.description}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Categories:
                    </Typography>
                    <div className="category-wrapper">
                        {categories}
                    </div>
                    <div className="action-wrapper">
                        <Typography align="center">
                            Are you satisfied?
                        </Typography>
                        <div className="button-wrapper">
                            <Button variant="contained"
                                    size='large'
                                    style={{marginRight: 5}}
                                    startIcon={<ArrowBackIcon/>}
                                    onClick={handleBack}>
                                Back
                            </Button>
                            <Button onClick={handleFinalize}
                                    color="primary"
                                    style={{marginLeft: 5}}
                                    disabled={submitting}
                                    endIcon={submitting && <CircularProgress size={20} color="inherit"/>}
                                    variant="contained"
                                    size="large">
                                Finish
                            </Button>
                        </div>
                    </div>

                </div>
            </Container>
            <style jsx>{`
                .content-title {
                    text-align: center;
                    font-weight: 300;
                    color: rgb(0, 210, 170);
                    font-size: calc(1.2em + 1.5vw);
                }
                
                .action-wrapper {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: space-between;
                }
                
                .button-wrapper {
                  display: flex;
                  justify-content: center;
                }
            `}</style>
        </Fragment>
    );
};

export default CompleteGroup;
