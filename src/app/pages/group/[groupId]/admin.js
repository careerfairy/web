import { useEffect, useState } from 'react'
import { Container, Button, Image } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from '../../../data/firebase';
import Header from '../../../components/views/header/Header';
import Loader from '../../../components/views/loader/Loader';

import Head from 'next/head';
import Footer from '../../../components/views/footer/Footer';
import UserCategorySelector from '../../../components/views/profile/UserCategorySelector';
import LivestreamCard from '../../../components/views/livestream-card/LivestreamCard';

const JoinGroup = (props) => {
    
    const router = useRouter();
    const groupId = router.query.groupId;

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [livestreams, setLivestreams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesWithElements, setCategoriesWithElements] = useState([]);

    const [group, setGroup] = useState([]);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            }  else {
                router.replace('/login');
            }
        })
    }, []);

    useEffect(() => {
        if (groupId) {
            props.firebase.getCareerCenterById(groupId).then(querySnapshot => {
                let careerCenter = querySnapshot.data();
                careerCenter.id = querySnapshot.id;
                setGroup(careerCenter);
            });
        }        
    }, [groupId]);

    useEffect(() => {
        if (groupId) {
            setLoading(true);
            props.firebase.getGroupCategories(groupId).then(querySnapshot => {
                let categories = [];
                querySnapshot.forEach( doc => {
                    let category = doc.data();
                    category.id = doc.id;
                    categories.push(category);
                });
                setCategories(categories);
                setLoading(false);
            })
        }
    },[groupId]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            setLoading(true);
            let categoriesWithElements = [];
            categories.forEach((category, index) => {
                props.firebase.getGroupCategoryElements(groupId, category.id).then(querySnapshot => {
                    let elements = [];
                    querySnapshot.forEach( doc => {
                        let element = doc.data();
                        element.id = doc.id;
                        elements.push(element);
                    });
                    category.elements = elements;
                    categoriesWithElements.push(category);
                    if (index + 1 === categories.length) {
                        setCategoriesWithElements(categoriesWithElements);
                        setLoading(false);
                    }
                });
            });
        }
    },[categories]);

    useEffect(() => {
        if (groupId) {
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
    },[groupId]);

    if (user === null || loading === true) {
        return <Loader/>;
    }

    const livestreamElement = livestreams.map( (livestream, index) => {
        return(
            <div  className='livestream-container' key={index}>
                <div>
                    { livestream.title }
                </div>
                <style jsx>{`
                    .livestream-container {
                        padding: 40px 20px;
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 0 5px grey;
                        display: inline-block;
                        margin: 10px;
                        vertical-align: top;
                    }
                `}</style>
            </div>
        );
    })

    return (
            <div className='greyBackground'>
                <Head>
                    <title key="title">CareerFairy | Join Groups</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container textAlign='left' style={{ padding: '30px 0'}}>
                    <div className='image-container'>
                        <Image style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: '0 auto 50px auto', maxHeight: '40%', maxWidth: '70%'}} src={group.logoUrl}/>
                    </div>
                    <h1 className='group-name'>{ group.universityName }</h1>
                    <div className='livestream-box'>
                        { livestreamElement }
                    </div>
                </Container>
                <Footer/>
                <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .greyBackground {
                        background-color: rgb(250,250,250);
                        height: 100%;
                        min-height: 100vh;
                    }

                    .image-container {
                        position: relative;
                        width: 200px;
                        height: 200px;
                        border-radius: 50%;
                        border: 5px solid rgb(0, 210, 170);
                        background-color: white;
                        margin: 0 auto;
                        box-shadow: 0 0 5px rgb(200,200,200);
                    }

                    .field-error {
                        margin-top: 10px;
                        color: red;
                    }

                    .join-group-title {
                        text-align: left;
                        margin: 0 0 30px 0;
                        font-weight: 700;
                        font-size: 1.3em;
                        color: rgb(80,80,80);
                    }

                    .group-name {
                        text-align: center;
                        margin: 20px 0 20px 0;
                        font-weight: 500;
                        font-size: calc(2em + 1.2vw);
                        color: rgb(0, 210, 170);
                    }

                    .livestream-box {
                        width: 100%;
                        border: 2px solid red;
                        overflow-x: scroll;
                        overflow-y: hidden; 
                        white-space: nowrap;
                    }

                    #profileContainer {
                        padding: 30px 0;
                    }
                `}</style>
            </div>
    );
};

export default withFirebase(JoinGroup);