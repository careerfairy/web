import React from 'react';

import { Container, Image, Grid, Header, Icon } from 'semantic-ui-react';
import ElementTagList from '../common/ElementTagList';
import CompanyLocationFlags from '../common/CompanyLocationFlags';

import JobDescriptions from '../job-descriptions/JobDescriptions';
import { withFirebase } from '../../../context/firebase';

function CompanyDiscoverPage(props) {

    return (
        <div className='discover-container'>
            <Container textAlign='center'>
                <Grid stackable centered={false} textAlign='left' className='middle aligned'>
                    <Grid.Row columns={2}>
                        <Grid.Column textAlign='left' width={8} className='computer only tablet only'>
                            <Image style={{ display: 'inline-block', maxHeight: '150px',  width: 'auto' }} src={ props.company.logoUrl } size='medium'/>
                        </Grid.Column>
                        <Grid.Column textAlign='right' width={8} className='computer only tablet only'>
                            <a href={'http://www.' + props.company.url} target="_blank" rel="noopener noreferrer" id='visit-website-button'>Visit Website</a>
                        </Grid.Column>
                        <Grid.Column textAlign='center' width={16} className='mobile only'>
                            <Image id='discover-logo' src={ props.company.logoUrl } size='medium'/>
                        </Grid.Column>
                        <Grid.Column textAlign='center' width={16} className='mobile only'>
                            <a href={'http://www.' + props.company.url} target="_blank" rel="noopener noreferrer" id='visit-website-button'>Visit Website</a>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid stackable centered={false} textAlign='left'>
                    <Grid.Row columns={1}>
                        <Grid.Column textAlign='left'>
                            <div id='discover-company-description'><span>{ props.company.industry }</span>{ props.company.headquarters }</div>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column id='discover-products'>
                            <Header as='h5' id='discover-inner-header'>What you should know about us</Header>
                            <p>{ props.company.mainProducts }</p>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={3}>
                        <Grid.Column id='discover-hiring'>
                            <Header as='h5' id='discover-inner-header'>Hiring from</Header>
                            <ElementTagList fields={ props.company.fieldsHiring } />
                        </Grid.Column>
                        <Grid.Column id='discover-employee-count'>
                            <Header as='h5' id='discover-inner-header-employees'>Employees</Header>
                            <p style={{ fontSize: '3em', fontWeight: '500', marginBottom: '0' }}>{ props.company.employees }</p>
                            <div className='discover-employee-gender-distribution'>
                                <Icon name='woman' size='large'/>
                                { props.company.femaleRatio}%
                                <Icon name='man' size='large'/>
                                {100 - props.company.femaleRatio}%
                            </div>
                        </Grid.Column>
                        <Grid.Column id='discover-locations'>
                            <Header as='h5' id='discover-inner-header'>Locations</Header>
                            <CompanyLocationFlags countries={props.company.locations} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid id='discover-hiring-grid' textAlign='left' stackable style={{ marginBottom: '20px'}}>
                    <Grid.Row columns={3}>
                        <JobDescriptions {...props} company={props.company} />
                    </Grid.Row>
                </Grid>
            </Container>
            <Container textAlign="center" className="titleFooter dark" onClick={() => props.fullpageApi.moveSectionDown()}>
                <p id='footer'>
                    Watch {props.company.name }
                </p>
                <Icon name='angle down' size='big' id='footer_icon'/>
            </Container>
            <style jsx>{`
                .discover-container {
                    padding-top: 2%;
                }

                #discover-logo, #discover-company-name {
                    display: inline-block;
                    vertical-align: top;
                }

                #discover-company-name h2 {
                    font-weight: 500;
                }

                #discover-company-industry {
                    color: rgb(30,30,30);
                    margin: 5px 0;
                }

                #discover-company-description {
                    margin: 20px 0;
                    text-transform: uppercase;
                    font-size: 1.2em;
                    color: rgb(180,180,180);;
                }

                #discover-company-description span {
                    text-transform: uppercase;
                    color: rgb(80,80,80);
                    font-size: 1.3em;
                    margin-right: 5px;
                }

                #discover-inner-header {
                    font-weight: 500;
                    color: rgb(170,170,170);
                    margin-bottom: 10px;
                    font-size: 0.9em;
                    text-transform: uppercase;
                }

                #discover-inner-header-hidden {
                    font-weight: 500;
                    color: rgb(100,100,100);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    opacity: 0;
                }

                #discover-inner-header-employees {
                    font-weight: 500;
                    color: rgb(170,170,170);
                    margin-bottom: 0;
                    font-size: 0.9em;
                    text-transform: uppercase;
                }

                #discover-products p {
                    font-size: 1.1em;
                }

                #discover-employee-count p {
                    font-size: 3em;
                    font-weight: 500;
                    margin-bottom: 0;
                }

                #discover-watch-link {
                    margin-bottom: 60px;
                }

                #discover-hiring-grid {
                    margin-top: 20px;
                    margin-bottom: 60px;
                }

                #discover-hiring {
                    margin-bottom: 0px;
                }

                #discover-hiring-header {
                    font-size: 1.2em;
                    margin-top: 0;
                    text-transform: uppercase;
                    color: rgb(40,40,40);
                }

                #discover-hiring-description {
                    width: 80%;
                }

                #discover-hiring-link {
                    margin-bottom: 20px;
                }

                #discover-watch-link {
                    margin-bottom: 60px;
                }

                #discover-watch-link a{
                    color: rgb(80, 80, 80);
                }

                #discover-watch-link a span{
                    color: rgba(255, 0, 0, 0.6);
                }

                #discover-watch-link a i{
                    margin-left: 10px;
                }

                #visit-website-button {
                    background-color: rgb(0,210,170);
                    padding: 20px 80px;
                    border-radius: 10px;
                    font-weight: 500;
                    font-size: 1.1em;
                    color: white;
                    height: 40px;
                }

                #visit-website-button:hover {
                    background-color: rgb(0,190,150);
                }

                .titleFooter.dark #footer, .titleFooter.dark #footer_icon {
                    color: black;
                }
            `}</style>
        </div>
    );
}

export default withFirebase(CompanyDiscoverPage);