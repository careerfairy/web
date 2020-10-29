import {useState, useEffect} from 'react';
import {Header as SemanticHeader, Image} from "semantic-ui-react";

import { withFirebasePage } from 'context/firebase';

function IconsContainer({ livestreamId, firebase }) {
    
    const [postedIcons, setPostedIcons] = useState([]);
    const [filteredIcons, setFilteredIcons] = useState([]);

    useEffect(() => {
        if (livestreamId) {
            firebase.listenToLivestreamIcons(livestreamId, querySnapshot => {
                let iconsList = [];
                querySnapshot.forEach(doc => {
                    let icon = doc.data();
                    icon.id = doc.id;
                    iconsList.push(icon);
                });
                setPostedIcons(iconsList);
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (postedIcons.length) {
            if (filteredIcons.length < 250) {
                if (!filteredIcons.some( icon => icon.id === postedIcons[postedIcons.length - 1].id)) {
                    setFilteredIcons([...filteredIcons, postedIcons[postedIcons.length - 1]]);
                }
            } else {
                if (!filteredIcons.some( icon => icon.id === postedIcons[postedIcons.length - 1].id)) {
                    setFilteredIcons([...filteredIcons.slice(filteredIcons.length - 150), postedIcons[postedIcons.length - 1]]);
                }
            }
        }
    }, [postedIcons]);

    function getIconColor(icon) {
        if (icon.iconName === 'like') {
            return 'red'
        }
        if (icon.iconName === 'clapping') {
            return 'orange'
        }
        if (icon.iconName === 'heart') {
            return 'yellow'
        }
    }

    function getRandomHorizontalPosition(icon, maxDistance) {
        return icon.randomPosition * maxDistance;
    }

    let postedIconsElements = filteredIcons.map( (icon, index) => {
        return (
            <div key={icon.id} className='animate__animated animate__fadeOutUpBig animate__slower' style={{ position: 'absolute', right: getRandomHorizontalPosition(icon, 90) + 'px' }}>
                <div className='action-container'>
                    <div className={'button action-button ' + getIconColor(icon)}>
                        <Image src={'/' + icon.iconName + '.png'}  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '25px'}}/>
                    </div>
                </div>
                <style jsx>{`
                    .animate__animated.animate__fadeOutUpBig {
                        --animate-duration: 4s;
                    }

                    .action-button {
                        border-radius: 50%;
                        background-color: rgb(0, 210, 170);
                        width: 50px;
                        height: 50px;
                        cursor: pointer;
                        box-shadow: 0 0 8px rgb(120,120,120);
                    }

                    .action-button.red {
                        background-color: #e01a4f;
                    }

                    .action-button.orange {
                        background-color: #f15946;
                    }

                    .action-button.yellow {
                        background-color: #f9c22e;
                    }
                `}</style>
            </div>
        );
    });

    return (
        <div className='topLevelContainer'>
            <div className='icons-container'>
                { postedIconsElements }
            </div>
            <style jsx>{`

            `}</style>
        </div>
    );
}

export default withFirebasePage(IconsContainer);