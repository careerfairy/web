import {Fragment, useState, useEffect} from 'react';
import {Grid, Image, Button, Icon, Modal, Step, Input, Checkbox} from 'semantic-ui-react';
import {withFirebase} from 'data/firebase';
import CategoryElement from 'components/views/group/admin/CategoryElement';
import CategoryEdit from "../CategoryEdit";


const Settings = (props) => {

    const [categories, setCategories] = useState([]);
    const [createMode, setCreateMode] = useState(false)
    console.log(createMode);

    useEffect(() => {
        if (props.groupId) {
            props.firebase.listenToGroupCategories(props.groupId, querySnapshot => {
                let categories = [];
                querySnapshot.forEach(doc => {
                    let category = doc.data();
                    category.id = doc.id;
                    categories.push(category);
                });
                setCategories(categories);
            })
        }
    }, [props.groupId]);

    const categoryElements = categories.map((category, index) => {
        return (
            <div key={index}>
                <CategoryElement groupId={props.groupId} category={category}/>
            </div>
        );
    })

    return (
        <Fragment>
            <div style={{width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                <h3 className='sublabel'>Settings</h3>
                <Button color="teal" className="create-btn" onClick={() => setCreateMode(true)} disabled={createMode} content={createMode ?'New Category':'Add Category'} size='large' icon={!createMode && 'add'}
                        style={{float: 'right', verticalAlign: 'middle'}}/>
            </div>
            {createMode ?
                <CategoryEdit groupId={props.groupId} category={{}} options={[]} newCategory={true} setEditMode={setCreateMode}/>: null
            }
            {categoryElements}
            <style jsx>{`
                .sublabel {
                    text-align: left;
                    display: inline-block;
                    vertical-align: middle;
                    margin: 9px 0;
                    color: rgb(80,80,80);
                }
                
  
            `}</style>
        </Fragment>
    );
}

export default withFirebase(Settings);