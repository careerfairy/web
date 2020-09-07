import {Fragment, useState, useEffect} from 'react';
import {Grid, Icon} from "semantic-ui-react";

import {withFirebase} from 'data/firebase';
import CategoryEdit from './CategoryEdit';


function CategoryElement({groupId, handleUpdateCategory, category, firebase, handleAddTempCategory, handleDeleteLocalCategory}) {

    const [options, setOptions] = useState([]);
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        if (groupId !== 'temp' && category) {
            firebase.listenToGroupCategoryElements(groupId, category.id, querySnapshot => {
                let elements = [];
                querySnapshot.forEach(doc => {
                    let element = doc.data();
                    element.id = doc.id;
                    elements.push(element);
                });
                setOptions(elements);
            });
        }
    }, [category]);

    useEffect(() => {
        if (groupId === "temp") {
            setOptions(category.options)
        }
    }, [category.options])

    const optionElements = options.map((option, index) => {
        return (
            <Fragment key={option.id || index}>
                <div className='option-container'>
                    {option.name}
                </div>
                <style jsx>{`
                    .hidden {
                        display: none
                    }

                    .option-container {
                        display: inline-block;
                        border: 1px solid black;
                        border-radius: 20px;
                        padding: 5px 10px;
                        margin: 2px;
                    }
                `}</style>
            </Fragment>
        );
    });

    if (editMode === false) {
        return (
            <Fragment>
                <div className='white-box'>
                    <Grid>
                        <Grid.Column width={4}>
                            <div className='white-box-label'>Category Name</div>
                            <div className='white-box-title'>
                                {category.name}
                            </div>
                        </Grid.Column>
                        <Grid.Column width={11}>
                            <div className='white-box-label'>Category Options</div>
                            {optionElements}
                        </Grid.Column>
                        <Grid.Column width={1}>
                            <Icon name='edit' style={{margin: '5px 0', color: 'rgb(0, 210, 170)', cursor: 'pointer'}}
                                  onClick={() => setEditMode(true)} size='large'/>
                        </Grid.Column>
                    </Grid>
                </div>
                <style jsx>{`
                .hidden {
                    display: none
                }
                
                .white-box {
                    background-color: white;
                    box-shadow: 0 0 5px rgb(190,190,190);
                    border-radius: 5px;
                    padding: 20px;
                    margin: 10px 0;
                    text-align: left;
                }

                .white-box-label {
                    font-size: 0.8em;
                    font-weight: 700;
                    color: rgb(160,160,160);
                    margin: 0 0 5px 0; 
                }

                .white-box-title {
                    font-size: 1.2em;
                    font-weight: 700;
                    color: rgb(80,80,80);
                }
            `}</style>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <CategoryEdit groupId={groupId}
                          handleUpdateCategory={handleUpdateCategory}
                          handleAddTempCategory={handleAddTempCategory}
                          handleDeleteLocalCategory={handleDeleteLocalCategory}
                          category={category}
                          options={options}
                          setEditMode={setEditMode}/>
        </Fragment>
    );
}

export default withFirebase(CategoryElement);