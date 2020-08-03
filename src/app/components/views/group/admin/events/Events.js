import { Fragment, useState, useEffect } from 'react';
import { Grid, Image, Button, Icon, Modal, Step, Input, Checkbox, Dropdown, Menu } from "semantic-ui-react";
import { withFirebase } from 'data/firebase';
import { SizeMe } from 'react-sizeme';
import StackGrid from 'react-stack-grid';
import LivestreamCard from 'components/views/livestream-card/LivestreamCard';
import { useRouter } from 'next/router';

const Events = (props) => {

    const router = useRouter();

    const [grid, setGrid] = useState(null);
    const [showAllLivestreams, setShowAllLivestreams] = useState(false);
    const [livestreams, setLivestreams] = useState([]);

    useEffect(() => {
        if (props.groupId) {
            const unsubscribe = props.firebase.listenToUpcomingLivestreams(querySnapshot => {
                var livestreams = [];
                querySnapshot.forEach(doc => {
                    let livestream = doc.data();
                    livestream.id = doc.id;
                    livestreams.push(livestream);
                });
                setLivestreams(livestreams);
            }, error => {
                console.log(error);
            });
            return () => unsubscribe();
        }
    },[props.groupId]);

    useEffect(() => {
        if (grid) {
            setTimeout(() => {
                grid.updateLayout();
            }, 10);
        }
    }, [grid, livestreams, props.menuItem]);

    let livestreamElements = [];

    if (showAllLivestreams) {
        livestreamElements = livestreams.map( (livestream, index) => {
            return(
                <div key={index}>
                    <LivestreamCard livestream={livestream} user={props.user} userData={props.userData} fields={null} grid={grid} careerCenters={[]}/>
                </div>
            );
        });
    } else {
        livestreamElements = livestreams.slice(0,2).map( (livestream, index) => {
            return(
                <div key={index}>
                    <LivestreamCard livestream={livestream} user={props.user} userData={props.userData} fields={null} grid={grid} careerCenters={[]}/>
                </div>
            );
        });
    }
        
    return(
        <Fragment>
            <div style={{ width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                <h3 className='sublabel'>Your Next Live Streams</h3>
                <Dropdown 
                    text='New Live Stream'
                    icon='add'
                    floating
                    labeled
                    button
                    style={{ float: 'right', verticalAlign: 'middle', margin: '0'}}
                    className='icon'>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            text='Send a Company Request'
                            onClick={() => router.push('/group/' + props.groupId + '/admin/schedule-event')}
                        />
                        <Dropdown.Item
                            text='Schedule a Live Stream'
                            onClick={() => {}}
                        />
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <SizeMe>{ ({ size }) => (
                <StackGrid
                    duration={0}
                    columnWidth={(size.width <= 768 ? '100%' : '50%')}
                    gutterWidth={20}
                    gutterHeight={20}
                    gridRef={ grid  => setGrid(grid) }>
                    { livestreamElements }
                </StackGrid>
            )}</SizeMe>
            <style jsx>{`
                .hidden {
                    display: none;
                }
                
                .white-box {
                    background-color: white;
                    box-shadow: 0 0 5px rgb(190,190,190);
                    border-radius: 5px;
                    padding: 20px;
                    margin: 10px;
                    text-align: left;
                }

                .white-box-label {
                    font-size: 0.8em;
                    font-weight: 700;
                    color: rgb(160,160,160);
                    margin: 5px 0 5px 0; 
                }

                .white-box-title {
                    font-size: 1.2em;
                    font-weight: 700;
                    color: rgb(80,80,80);
                }

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

export default withFirebase(Events);