import { Fragment, useState, useEffect } from 'react';
import { Grid, Image, Button, Icon, Modal, Dropdown, Input, Header } from 'semantic-ui-react';

import { useRouter } from 'next/router';
import { withFirebase } from 'data/firebase';


function CategoryEditModalOption(props) {

    if (!props.updateMode.mode) {
        return null;
    }

    if (props.updateMode.mode === 'add') {
        const [ newOptionName, setNewOptionName ] = useState('');
        return(
            <Fragment>
                <div className={ props.updateMode.mode ? 'modal' : ''}></div>   
                <div className='padding animated fadeIn'>
                    <div className='action'>
                        Add an option named 
                        <Input type='text' placeholder='Option Name' value={ newOptionName } onChange={(event, data) => setNewOptionName(data.value)}  style={{ width: '30%', margin: '0 20px 0 10px' }}/>
                    </div>
                    <div className='buttons'>
                        <Button content={'Confirm'} onClick={() => props.handleAdd({ name: newOptionName })} primary/>
                        <Button content={'Cancel'} onClick={() => props.setUpdateMode({})}/>
                    </div>
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

    if (props.updateMode.mode === 'rename') {
        const [ newOptionName, setNewOptionName ] = useState('');
        return(
            <Fragment>
                <div className={ props.updateMode.mode ? 'modal' : ''}></div>   
                <div className='padding animated fadeIn'>
                    <div className='action'>
                        Rename the option <span>{ props.updateMode.option.name }</span> to
                        <Input type='text' placeholder='Option Name' value={ newOptionName } onChange={(event, data) => setNewOptionName(data.value)}  style={{ width: '30%', margin: '0 20px 0 10px' }}/>
                    </div>
                    <p className='explanation'>All your members who are currently classified under  <span>{ props.updateMode.option.name }</span> will now be classified under <span>{ newOptionName }</span>.</p>
                    <div className='buttons'>
                        <Button content={'Confirm'} onClick={() => props.handleRename({ id: props.updateMode.option.id, name: newOptionName })} primary/>
                        <Button content={'Cancel'} onClick={() => props.setUpdateMode({})}/>
                    </div>
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