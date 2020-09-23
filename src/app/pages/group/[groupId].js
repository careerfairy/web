import { useEffect, useState } from 'react'
import { Container, Button, Image } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from '../../context/firebase';
import Header from '../../components/views/header/Header';
import Loader from '../../components/views/loader/Loader';

import Head from 'next/head';
import Footer from '../../components/views/footer/Footer';
import UserCategorySelector from '../../components/views/profile/UserCategorySelector';
import {GlobalBackground} from "../../materialUI/GlobalBackground/GlobalBackGround";

const JoinGroup = (props) => {
    
    const router = useRouter();
    const groupId = router.query.groupId;

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoriesWithElements, setCategoriesWithElements] = useState([]);

    const [group, setGroup] = useState([]);
    const [checkError, setCheckError] = useState(0);

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
        setLoading(true);
        if (user) {
            props.firebase.getUserData(user.email)
            .then(querySnapshot => {
                setLoading(false);
                let user = querySnapshot.data();
                if (user) {
                    setUserData(user);
                }
            }).catch(error => {
                setLoading(false);
                console.log(error);
            });
        }
    },[user]);

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

    function setCategoryValue(categoryId, valueId) {
        let updatedCategories = [];
        categoriesWithElements.forEach( category => {
            if (category.id === categoryId) {
                let elements = [];
                category.elements.forEach( element => {
                    if (element.id === valueId) {
                        element.selected = true;
                    } else {
                        element.selected = false;
                    }
                    elements.push(element);
                });
                category.elements = elements;
            }
            updatedCategories.push(category);
        });
        setCategoriesWithElements(updatedCategories);
    }

    function joinGroup() {
        props.firebase.joinGroup(userData.userEmail, groupId, categoriesWithElements);
    }

    if (user === null || userData === null ||loading === true) {
        return <Loader/>;
    }

    let categorySelectors = categoriesWithElements.map( category => {
        return (
            <div style={{ margin: '15px 0 0 0', textAlign: 'left' }}>   
                <UserCategorySelector userData={userData} groupId={groupId} category={category} categoriesWithElements={categoriesWithElements} updateValue={(valueId) => setCategoryValue(category.id, valueId)}/>
            </div>
        )
    });

    return (
            <GlobalBackground>
                <Head>
                    <title key="title">CareerFairy | Join Groups</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container textAlign='left' style={{ margin: '50px 0 60px 0', textAlign: 'center', backgroundColor: 'white', borderRadius: '10px', padding: '30px 20px 80px 20px', boxShadow: '0 0 5px rgb(220,220,220)' }}>
                    <h2 style={{ margin: '20px 0 40px 0', color: 'rgb(160,160,160)'}}>Join the group</h2>
                    <Image src={group.logoUrl} style={{ margin: '20px auto', maxWidth: '300px', maxHeight: '110px'}}/>
                    <div style={{ width: '100%', maxWidth: '500px', margin: '50px auto 30px auto' }}>
                        { categorySelectors }
                    </div>   
                    <Button icon='add' content='Join Group' size='large' onClick={() => joinGroup() } style={{ width: '100%', maxWidth: '500px' }} primary/>        
                </Container>
                <Footer/>
                <style jsx>{`
                    .hidden {
                        display: none;
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

                    #profileContainer {
                        padding: 30px 0;
                    }
                `}</style>
            </GlobalBackground>
    );
};

export default withFirebase(JoinGroup);