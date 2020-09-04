import React, {Fragment, useEffect, useState} from 'react';
import {Button} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CategoryEdit from "../admin/CategoryEdit";
import CategoryElement from "../admin/CategoryElement";
import AddIcon from "@material-ui/icons/Add";


const CreateCategories = ({handleBack, handleDeleteLocalCategory, handleUpdateCategory, handleAddTempCategory, handleNext, handleReset, setArrayOfCategories, arrayOfCategories, tempId, createCareerCenter}) => {
    const [createMode, setCreateMode] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!arrayOfCategories.length) {
            setCreateMode(true)
        }
    }, [])
    const groupId = "temp"

    const categoryElements = arrayOfCategories.map((category, index) => {

        return (
            <div key={index}>
                <CategoryElement handleDeleteLocalCategory={handleDeleteLocalCategory}
                                 handleUpdateCategory={handleUpdateCategory} groupId={groupId} category={category}/>
            </div>
        );
    })

    const handleFinalize = () => {
        setSubmitting(true)
        console.log("finished!")
        createCareerCenter()
        setSubmitting(false)
        // handleNext()
    }

    return (
        <Fragment>
            <div className="content-wrapper">
                <h1 className='content-title'>Add some Categories</h1>
                <div className="btn-title-wrapper" style={{width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                    <Button variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => setCreateMode(true)}
                            disabled={createMode}
                            endIcon={<AddIcon/>}>
                        Add
                    </Button>
                </div>
                <div className="categories-wrapper">
                    {createMode &&
                    <CategoryEdit handleAddTempCategory={handleAddTempCategory} groupId={groupId} category={{}}
                                  options={[]}
                                  newCategory={true} setEditMode={setCreateMode}/>}
                    {categoryElements}
                </div>
                <div className="button-wrapper">
                    <Button
                        variant="contained"
                        size='large'
                        style={{marginRight: 5}}
                        startIcon={<ArrowBackIcon/>}
                        onClick={handleBack}
                    >Back</Button>

                    <Button
                        color="primary"
                        size='large'
                        variant="contained"
                        disabled={submitting}
                        style={{marginLeft: 5}}
                        onClick={handleFinish}
                        endIcon={ submitting && <CircularProgress color="inherit" size={25}/> }
                    >Finalize</Button>
                </div>
            </div>

            <style jsx>{`
                .sublabel {
                    text-align: left;
                    display: inline-block;
                    vertical-align: middle;
                    margin: 9px 0;
                    color: rgb(80,80,80);
                }
                
                .content-title {
                  text-align: center;
                  font-weight: 300;
                  color: rgb(0, 210, 170);
                  font-size: calc(1.2em + 1.5vw);
                }
                
                .categories-wrapper {
                  display: flex;
                  flex: 1;
                  flex-direction: column;
                }
                
                .content-wrapper {
                  padding: 1rem;
                  min-height: 60vh;
                  display: flex;
                  justify-content: space-between;
                  flex-direction: column;
                }
                
                .button-wrapper {
                  display: flex;
                  justify-content: center;
                }
                
                .btn-title-wrapper{
                  display: flex;
                  justify-content: space-between;
                }
            `}</style>
        </Fragment>
    )
};

export default CreateCategories;
