import React, {Fragment, useState} from 'react'
import {Button, Card, CardContent, CardMedia, Container, Typography} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import {makeStyles} from '@material-ui/core/styles';
import DisplayCategoryElement from "./DisplayCategoryElement";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {useRouter} from "next/router";

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
});


const CompleteGroup = ({handleBack, baseGroupInfo, createCareerCenter, arrayOfCategories, setActiveStep}) => {
    const [submitting, setSubmitting] = useState(false)
    const classes = useStyles();

    const {push} = useRouter()

    const handleFinalize = async () => {
        setSubmitting(true)
        createCareerCenter().then(careerCenterRef => {
            const ID = careerCenterRef.id
            setSubmitting(false)
            push(`/group/${ID}/admin`)
        })
    }

    const categories = arrayOfCategories.map((category, index) => {
        return (
            <DisplayCategoryElement setActiveStep={setActiveStep} key={index} category={category}/>
        )
    })

    return (
        <Fragment>
            <Container style={{padding: 20}}>
                <h1 className='content-title'>Last Check</h1>
                <div>
                    <Typography variant="h5" gutterBottom>
                        Details:
                    </Typography>
                    <Card>
                        <CardMedia
                            component="image"
                            className={classes.media}
                            image={baseGroupInfo.logoUrl}
                            title="Paella dish"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                {baseGroupInfo.universityName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {baseGroupInfo.description}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Typography style={{marginTop: 10}} variant="h5" gutterBottom>
                        Categories:
                    </Typography>
                    <div className="category-wrapper">
                        {categories}
                    </div>
                    <div className="action-wrapper">
                        <Typography gutterBottom align="center">
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
