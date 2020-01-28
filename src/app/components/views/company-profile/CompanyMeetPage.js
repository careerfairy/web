import { Container, Grid, Image } from 'semantic-ui-react';

function CompanyMeetPage(props) {

    let profileImageUrl = 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Faxpo_seraina.jpg?alt=media';

    return (
        <div>
            <Container id='meetColumn' className='profile-container paddingContainer'>
                <h3 className='careerFairyBlogTitle'>CareerFairyBlog</h3>
                <h1 className='blogTitle'>Meet Seraina, Energy Analyst&nbsp;@&nbsp;Axpo</h1>
                <Grid columns={2} centered stackable>
                    <Grid.Row>
                        <Grid.Column>
                            <Image src={profileImageUrl} size='large'/>
                            <h2 className='interviewee'>Seraina Buchmeier</h2>
                            <h3 className='dateInterviewee'>2008 - 2015</h3>
                            <h4 className='jobInterviewee'>MSc in Electrical Engineering @ ETH Zurich</h4>
                            <h3 className='dateInterviewee'>2015 - 2016</h3>
                            <h4 className='jobInterviewee'>Trainee @ Axpo</h4>
                            <h3 className='dateInterviewee'>2017 - today</h3>
                            <h4 className='jobInterviewee'>Energy Analyst @ Axpo</h4>
                        </Grid.Column>
                        <Grid.Column>
                            <div className='interviewContent'>
                                <h3>Could you introduce yourself and tell us about your position at&nbsp;Axpo?</h3>
                                <p>Hi! I’m Seraina, I am 28 years old and I studied Electrical Engineering and Information Technology at ETH Zurich. I joined Axpo right after my studies in 2015 and started as a trainee. After the trainee programme, I started a permanent position as an energy analyst.</p>
                                <h3>What did you focus on in your&nbsp;studies?</h3>
                                <p>I was always interested in renewable energy technologies. In my masters, I attended lectures on power systems analysis, high voltage technology, and power markets. The work I did for my masters thesis also helps me a lot in this job.</p>
                                <h3>Why did you choose&nbsp;Axpo?</h3>
                                <p>I met Axpo at ETH Zurich's job fair and got in touch with them there. Since Axpo owns power plants and trades energy, there’s a strong economic perspective involved in everything you do. I enjoy having to consider this aspect in my work in addition to the more technical sides of the job.</p>
                                <h3>How did you know which role to apply&nbsp;to?</h3>
                                <p>I didn’t know exactly what I wanted to do, but I knew I wanted to focus on energy. Therefore, I applied for the trainee programme at Axpo, which gave me the opportunity to work on different projects and try out different teams.</p>
                                <h3>Was it a big change to move into industry from&nbsp;academia?</h3>
                                <p>It certainly was, but as a trainee, you have a transition period during which you get a lot of support and can do mistakes without anyone getting angry. However, it’s very different from university where you have to do everything perfectly. In the industry, it’s important to find viable solutions quickly.</p>
                                <h3>Can you tell us more about your&nbsp;role?</h3>
                                <p>I’m an energy analyst in the spot trading team. Basically, spot market trading is short term trading and covers everything happening from intraday up to 3-4 weeks ahead. My daily tasks include everything from data, modelling and forecasting, as well as writing market analysis and reports. We buy lots of market data, such as weather forecasts and we look at power plant outages. I combine all these data in the model and try to forecast the power prices for different countries in Europe. Based on these forecasts I elaborate trading strategies for the traders.</p>
                                <h3>Which skills are required in your&nbsp;job?</h3>
                                <p>In spot trading, you have to be really quick and flexible. It’s good to have a quantitative background, like engineering and maths – programming skills are helpful too. There’s also a big social component involved because I need to interact frequently with the traders. Market understanding is also very important, but I didn’t learn that back at university.</p>
                                <h3>Looking back, what would you change in your&nbsp;studies?</h3>
                                <p>I would have tried to take more courses in economics and finance. I didn’t do that during my studies because I didn’t know where I would end up. However, looking back it would have been valuable, even though I could still catch up on these topics on the job. Trading somehow lies in between engineering, economics, finance, quantitative analysis and it’s good to have an understanding of all of these fields.</p>
                                <h3>What do you like the most about your&nbsp;job?</h3>
                                <p>I like the hectic work environment because I get bored quite quickly. I also like the fact that after the trainee programme, I have been given lots of responsibility at such a young age. I feel like I can have an impact.</p>
                                <h3>What is the best way for a student to join&nbsp;Axpo?</h3>
                                <p>I think the best way is by going through the trainee programme, but there are also opportunities through masters thesis and internships. I think it’s important to get in touch with Axpo through one of these channels before starting a permanent position.</p>
                                <h3>What are the development opportunities at&nbsp;Axpo?</h3>
                                <p>The industry is currently undergoing a big change, and it’s an interesting period to be in. Since the unit that I am in has a very flat hierarchy, a management career can be difficult to pursue. You would rather take more responsibility in one specific area, which is what I have done. Alternatively, I could for instance join the trading team or change to a hub abroad and work from there for a couple of years.</p>
                                <h3>How was your transition into the&nbsp;industry?</h3>
                                <p>It wasn’t easy in the beginning, as a woman under 30 going into trading. Now, after a bit of a hard start, I have great colleagues so it was really worth it and I would definitely do it again!</p>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <style jsx>{`
                    #meetColumn {
                        position: relative;
                    }

                    .blogTitle {
                        margin: 80px 0 100px 0;
                        color: rgb(110,110,110);
                        font-weight: 600;
                        font-size: 4.6em;
                    }

                    .careerFairyBlogTitle {
                        font-weight: 300;
                        font-size: 2em;
                        color: rgb(0, 210, 170);
                    }

                    .interviewContent h3 {
                        color: rgb(0, 210, 170);
                        font-size: 1.9em;
                    }

                    .interviewContent p {
                        font-size: 1.2em;
                        margin-bottom: 60px;
                    }

                    .interviewee {
                        font-size: 2.5em;
                        font-weight: 300;
                    }

                    .dateInterviewee {
                        font-size: 1.5em;
                        font-weight: 300;
                    }

                    .jobInterviewee {
                        font-size: 1.3em;
                        font-weight: 500;
                    }
                `}</style>
            </Container>
        </div>
    );
}

export default CompanyMeetPage;