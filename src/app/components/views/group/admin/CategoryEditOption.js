import { Fragment, useState, useEffect } from 'react';
import {Grid, Image, Button, Icon, Modal, Dropdown, Input, Header, Form} from 'semantic-ui-react';

import { useRouter } from 'next/router';
import { withFirebase } from 'data/firebase';


function CategoryEditModalOption(props) {





    if (!props.updateMode.mode) {
        return null;
    }

    if (props.updateMode.mode === 'add') {
        const [ newOptionName, setNewOptionName ] = useState('');
        const [touched, setTouched] = useState(false)
        const [placeholder, setPlaceholder] = useState('Option Name')

        useEffect(() => {
            if (touched && !newOptionName.length) {
                setPlaceholder("Please fill this field")
            }
        }, [touched, newOptionName.length])

        const handleAddModal = (e) => {
            e.preventDefault()
            if (!newOptionName.length) return setTouched(true)
            props.handleAdd({ name: newOptionName })
        }

        return(
            <Fragment>
                <div className={ props.updateMode.mode ? 'modal' : ''}></div>   
                <div className='padding animated fadeIn'>
                    <Form onSubmit={handleAddModal}>
                    <div className='action'>
                        Add an option named
                        <Input maxLength="20" type='text' error={touched && !newOptionName.length} onBlur={() => setTouched(true)} placeholder={placeholder} value={ newOptionName } onChange={(event, data) => setNewOptionName(data.value)}  style={{ width: '30%', margin: '0 20px 0 10px' }}/>
                    </div>
                    <div className='buttons'>
                        <Button type="submit" content={'Confirm'} primary/>
                        <Button content={'Cancel'} onClick={() => props.setUpdateMode({})}/>
                    </div>
                    </Form>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none
                    }
    
                    .padding {
                        position: relative;
                        z-index: 20;
                        background-color: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 5px black;
                        margin: 20px 0;
                    }

                    .modal {
                        position: absolute;
                        z-index: 10;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgb(30,30,30,0.3);
                    }

                    .action {
                        font-size: 1.1em;
                    }
    
                    .explanation {
                        font-size: 0.9em;
                        margin: 10px 0 20px 0;
                    }

                    .explanation span, .action span {
                        font-weight: 700;
                    }
                    
                    .error-field {
                      position: absolute;
                      font-size: 1rem;
                      font-weight: lighter;
                      margin-top: 5px;
                      color: red;
                    }

                    .buttons {
                        margin: 20px 0 0 0;
                    }
                `}</style>
            </Fragment>
        );
    }

    if (props.updateMode.mode === 'deleteCategory') {
        return(
            <Fragment>
                <div className={ props.updateMode.mode ? 'modal' : ''}></div>
                <div className='padding animated fadeIn' style={{ margin: '20px 0'}}>
                    <div className='action'>
                        Delete the category <span>{ props.categoryName }</span>
                    </div>
                    <p className='explanation'>All your members who are currently classified under  <span>{ props.updateMode.option.name }</span> will not anymore belong to any category until they manually update their categorisation.</p>
                    <p className='explanation warning'>This operation cannot be reverted!</p>
                    <div className='buttons'>
                        <Button content={'Permanently Delete the Category ' + props.categoryName } onClick={props.handleDeleteCategory} primary/>
                        <Button content={'Cancel'} onClick={() => props.setUpdateMode({})}/>
                    </div>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none
                    }

                    .action {
                        font-size: 1.1em;
                    }

                    .modal {
                        position: absolute;
                        z-index: 10;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgb(30,30,30,0.3);
                    }

                    .padding {
                        position: relative;
                        z-index: 20;
                        background-color: white;
                        padding: 20px;
                        border-radius: 20px;
                    }

                    .explanation {
                        font-size: 0.9em;
                        margin: 10px 0 5px 0;
                    }

                    .warning {
                        color: red;
                        margin: 5px 0 20px 0;
                        font-weight: 700;
                    }

                    .explanation span, .action span {
                        font-weight: 700;
                    }

                    .buttons {
                        margin: 20px 0;
                    }
                `}</style>
            </Fragment>
        );
    }

    if (props.updateMode.mode === 'rename') {
        const [ newOptionName, setNewOptionName ] = useState('');

        const [touched, setTouched] = useState(false)
        const [placeholder, setPlaceholder] = useState('Option Name')

        useEffect(() => {
            if (touched && !newOptionName.length) {
                setPlaceholder("Please fill this field")
            }
        }, [touched, newOptionName.length])

        const handleRenameModal = (e) => {
            e.preventDefault()
            if (!newOptionName.length) return setTouched(true)
            props.handleRename({ id: props.updateMode.option.id, name: newOptionName })
        }

        return(
            <Fragment>
                <div className={ props.updateMode.mode ? 'modal' : ''}></div>   
                <div className='padding animated fadeIn'>
                    <Form onSubmit={handleRenameModal}>
                        <div className='action'>
                            Rename the option <span>{ props.updateMode.option.name }</span> to
                            <Input maxLength="20" type='text' error={touched && !newOptionName.length} onBlur={() => setTouched(true)} placeholder={placeholder} value={ newOptionName } onChange={(event, data) => setNewOptionName(data.value)}  style={{ width: '30%', margin: '0 20px 0 10px' }}/>
                        </div>
                        <p className='explanation'>All your members who are currently classified under  <span>{ props.updateMode.option.name }</span> will now be classified under <span>{ newOptionName }</span>.</p>
                        <div className='buttons'>
                            <Button content={'Confirm'} type="submit" primary/>
                            <Button content={'Cancel'} onClick={() => props.setUpdateMode({})}/>
                        </div>
                    </Form>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none
                    }
    
                    .padding {
                        position: relative;
                        z-index: 20;
                        background-color: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 5px black;
                        margin: 20px 0;
                    }

                    .modal {
                        position: absolute;
                        z-index: 10;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgb(30,30,30,0.3);
                    }

                    .action {
                        font-size: 1.1em;
                    }
    
                    .explanation {
                        font-size: 0.9em;
                        margin: 10px 0 20px 0;
                    }

                    .explanation span, .action span {
                        font-weight: 700;
                    }

                    .buttons {
                        margin: 20px 0 0 0;
                    }
                `}</style>
            </Fragment>
        );
    }
        
    if (props.updateMode.mode === 'delete') {
        return(
            <Fragment>
                <div className={ props.updateMode.mode ? 'modal' : ''}></div>   
                <div className='padding animated fadeIn' style={{ margin: '20px 0'}}>
                    <div className='action'>
                        Delete option <span>{ props.updateMode.option.name }</span> 
                    </div>
                    <p className='explanation'>All your members who are currently classified under  <span>{ props.updateMode.option.name }</span> will not anymore belong to any classification until they manually update their categorisation.</p>
                    <p className='explanation warning'>This operation cannot be reverted!</p>
                    <div className='buttons'>
                        <Button content={'Permanently Delete the Category ' + props.updateMode.option.name } onClick={() => props.handleDelete(props.updateMode.option)} primary/>
                        <Button content={'Cancel'} onClick={() => props.setUpdateMode({})}/>
                    </div>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none
                    }

                    .action {
                        font-size: 1.1em;
                    }

                    .modal {
                        position: absolute;
                        z-index: 10;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgb(30,30,30,0.3);
                    }

                    .padding {
                        position: relative;
                        z-index: 20;
                        background-color: white;
                        padding: 20px;
                        border-radius: 20px;
                    }

                    .explanation {
                        font-size: 0.9em;
                        margin: 10px 0 5px 0;
                    }

                    .warning {
                        color: red;
                        margin: 5px 0 20px 0;
                        font-weight: 700;
                    }

                    .explanation span, .action span {
                        font-weight: 700;
                    }

                    .buttons {
                        margin: 20px 0;
                    }
                `}</style>
            </Fragment>
        );
    }
}

export default withFirebase(CategoryEditModalOption);