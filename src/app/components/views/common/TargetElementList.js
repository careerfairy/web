import { Fragment } from 'react';
import { UNIVERSITY_SUBJECTS } from '../../../data/StudyFieldData';

function TargetElementList(props) {

    let list = props.fields;

    let tags = list.map((listElement, index) => {
        const selectionMode = props.selectedFields ? true : false;
        const targetElement = UNIVERSITY_SUBJECTS.find(subject => {
            return subject.value === listElement;
        });
        if (!targetElement) {
            console.error(listElement);
        }
        if (selectionMode === true) {
            const selected = props.selectedFields.indexOf(listElement) > -1;
            return (
                <Fragment key={index}>
                    <div className='tag' style={{ backgroundColor: selected ? 'rgb(44, 66, 81)' : 'white', color: selected ? 'white' : 'rgb(44, 66, 81)', border: '1px solid rgb(44, 66, 81)'}}>
                        {targetElement.text}
                    </div>
                    <style jsx>{`
                        .tag {
                            display: inline-block;
                            border-radius: 12px;
                            background-color: rgba(0,0,0,0);
                            padding: 2px 10px;
                            margin-right: 5px;
                            margin-bottom: 5px;
                            font-size: 0.8em;
                            font-weight: 500;
                        }
                `}</style>
                </Fragment>
            );
        } else {
            return (
                <Fragment key={index}>
                    <div className='tag' style={{ fontSize: props.size === 'large' ? '1.1em' : '0.8em', padding: props.size === 'large' ? '8px 15px' : '2px 10px', borderRadius: props.size === 'large' ? '20px' : '12px' }}>
                        {targetElement.text}
                    </div>
                    <style jsx>{`
                        .tag {
                            display: inline-block;
                            background-color: rgba(0,0,0,0);
                            margin-right: 5px;
                            margin-bottom: 5px;
                            font-weight: 500;
                            border: 1px solid rgb(44, 66, 81);
                            color: rgb(44, 66, 81);
                        }
                `}</style>
                </Fragment>
            );
        }
        
    })

    return (
        <Fragment>
            <div className='tag-container'>
                { tags }
            </div>
            <style jsx>{`
                .tag-container {
                    margin-top: 10px;
                }
            `}</style>
        </Fragment>
    );
}

export default TargetElementList;