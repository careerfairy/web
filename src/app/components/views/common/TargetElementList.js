import { Fragment } from 'react';
import { UNIVERSITY_SUBJECTS } from '../../../data/StudyFieldData';

function TargetElementList(props) {

    let list = props.fields;

    let tags = list.map((listElement, index) => {
        const selected = props.selectedFields.indexOf(listElement) > -1;
        const targetElement = UNIVERSITY_SUBJECTS.find(subject => {
            return subject.value === listElement;
        });
        if (!targetElement) {
            console.error(listElement);
        }
        return (
            <Fragment>
                <div className='tag' key={listElement} style={{ backgroundColor: selected ? targetElement.color : 'white', color: selected ? 'white' : targetElement.color, border: '1px solid ' + targetElement.color}}>
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