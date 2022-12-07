import React, { Component } from 'react';

class InfoBox extends Component {
    render() {
        return (
            <div className="jumbotron jumbotron-less-padding">
                <h5 className="font-weight-bold">How does it work?</h5>
                <p className="small-text">
                    Upload your figuredata and figuremap, the service will then compare it against the up-to-date Habbo files, and find the missing clothing. 
                </p>
                <p className="small-text">
                    The missing clothing will be downloaded, your files will be updated to include them, SQL queries and furnidata entries will be generated.
                    Everything will then be downloaded as a .zip file.
                </p>
                <h6 className="font-weight-bold">Don't worry, it won't delete your custom clothing.</h6>
            </div>
        );
    }
}

export default InfoBox;