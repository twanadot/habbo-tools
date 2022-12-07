import React, { Component } from 'react';
import ClothingUpdater from '../../utils/ClothingUpdater';
import LoadingDisplay from '../LoadingDisplay';
import SummaryModal from '../SummaryModal';

import SourceInput from './SourceInput';
import UserInputs from './UserInputs';
import Alert from './Alert';

class Clothing extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: '',
            loadingActive: false,
            loadingInfo: '',
            loadingPercentage: undefined
        }

        this.userInput = React.createRef();
        this.summaryModal = React.createRef();
        this.sourceInput = React.createRef();
    }

    handleStart = async () => {
        this.setState({ error: '', loadingInfo: 'Initializing...', loadingActive: true })

        var options = {
            onProgress: this.handleProgress,
            onError: this.handleError,
            externalVariablesUrl: this.sourceInput.current.getExternalVariablesUrl() || undefined,
            isCustom: this.sourceInput.current.state.custom,
            sourceFiguredataUrl: this.sourceInput.current.state.sourceFiguredataUrl || undefined,
            sourceFiguremapUrl: this.sourceInput.current.state.sourceFiguremapUrl || undefined,
            sourceFurnidataUrl: this.sourceInput.current.state.sourceFurnidataUrl || undefined,
            hofFurniUrl: this.sourceInput.current.state.hofFurniUrl || undefined,
            productionUrl: this.sourceInput.current.state.productionUrl || undefined,
        }

        options = await this.userInput.current.getOptions(options);

        if (typeof options === 'string') {
            this.handleError(options);
            return;
        }

        new ClothingUpdater(options);
    }

    handleProgress = (progress) => {
        if (progress.type === 'done') {
            this.handleDone(progress.info);
        }

        this.setState({ loadingInfo: progress.info, loadingPercentage: progress.percentage });
    }

    handleDone = (summary) => {
        this.setState({ loadingActive: false });
        this.summaryModal.current.showModal(summary);
    }

    handleError = (error) => {
        this.setState({ error: error, loadingActive: false });
    }

    render() {
        return (
            <React.Fragment>
                <LoadingDisplay 
                    active={this.state.loadingActive} 
                    info={this.state.loadingInfo} 
                    percentage={this.state.loadingPercentage} />
                <SummaryModal ref={this.summaryModal} />
                <div className="card card-default">
                    <div className="card-header text-center">
                        <h4 className="page-title">Clothing Updater</h4>
                    </div>
                    <div className="card-body">
                        <Alert error={this.state.error} />
                        <div className="row">
                            <div className="col-lg-6 col-xl-6 col-12">
                                <UserInputs ref={this.userInput} />
                            </div>
                            <div className="col-lg-6 col-xl-6 col-12">
                                <SourceInput ref={this.sourceInput} />
                            </div>
                        </div>
                    </div>
                    <div className="card-footer text-center">
                        <button className="btn btn-primary" onClick={this.handleStart}>Start</button>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Clothing;
