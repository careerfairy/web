import React, {Fragment} from 'react';
import {Dropdown} from "semantic-ui-react";

const CategoryOptionElement = ({selectedOption, setSelectedOption, optionEl, setUpdateMode}) => {
    return (
        <Fragment key={index}>
            <div className={'option-container animated fadeIn'}
                 style={{zIndex: selectedOption === optionEl ? '10' : '0'}}>
                <div className='option-name'>
                    {optionEl.name}
                </div>
                <Dropdown icon={{name: 'edit', onClick: () => setSelectedOption(optionEl)}} direction='right'
                          style={{margin: '0 0 0 5px'}}>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            text='Rename'
                            onClick={() => setUpdateMode({mode: 'rename', option: optionEl})}
                        />
                        <Dropdown.Item
                            text='Delete'
                            onClick={() => setUpdateMode({mode: 'delete', option: optionEl})}
                        />
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <style jsx>{`
                    .hidden {
                        display: none
                    }

                    .option-container {
                        position: relative;
                        display: inline-block;
                        border: 1px solid rgb(52,73,102);
                        background-color: white;
                        border-radius: 20px;
                        padding: 5px 10px;
                        margin: 2px;
                        color: rgb(52,73,102);
                        box-shadow: 0 0 2px grey;
                    }

                    .option-name {
                        display: inline-block;
                    }

                    .update {
                        background-color: rgb(52,73,102);
                        color: white;
                    }
                `}</style>
        </Fragment>
    );
};

export default CategoryOptionElement;
