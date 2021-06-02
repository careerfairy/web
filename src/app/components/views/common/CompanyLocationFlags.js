function CompanyLocationFlags(props) {

    let locations = props.countries;

    let flags = locations.map((listElement, index) => {
        return(
            <div className='flagContainer' key={listElement}>
                <img style={{ borderRadius: '8px', opacity: '0.7', height: '50px' }} src={ 'https://restcountries.eu/data/' + listElement + '.svg' }/>
                <style jsx>{`
                    .flagContainer {
                        display: inline-block;
                        margin-right: 5px;
                        box-shadow: 0 0 3px grey;
                        border-radius: 8px;
                    }
                `}</style>
            </div>
        );
    })

    return (
        <div>
            { flags }
        </div>
    );
}

export default CompanyLocationFlags;