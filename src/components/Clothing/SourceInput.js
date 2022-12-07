import React, { Component } from 'react';
import Select from 'react-simple-select';

import { OFFICIAL_HOTELS, HABBO_EXTERNAL_VARIBLES_URL } from '../../Constants';
import Utility from '../../utils/Utility';
import $ from 'jquery';

import InfoBox from './InfoBox';

class SourceInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            custom: false,
            hotel: 'habbo.com',
            customExternalVariables: '',
            sourceFiguredataUrl: '',
            sourceFiguremapUrl: '',
            sourceFurnidataUrl: '',
            productionUrl: '',
            hofFurniUrl: ''
        }
    }

    getExternalVariablesUrl = () => {
        let url = (this.state.custom) 
            ? this.state.customExternalVariables 
            : Utility.format(HABBO_EXTERNAL_VARIBLES_URL, this.state.hotel);

        if (this.state.hotel === 'sandbox.habbo.com')
            url = url.replace('www.', '');

        return url;
    }

    handleCustomChange = (e) => {
        let isCustom = e.target.getAttribute("data-custom") === 'true';
        this.setState({ custom: isCustom })
    }

    handleSpoilerClick = (e) => {
        e.preventDefault()
        $(e.target).parent().children('.spoiler-body').collapse('toggle')
    }

    handleHotelChange = (e) => {
        this.setState({ hotel: e.currentTarget.value });
    }

    handleChange = (e) => {
        let stateKey = e.currentTarget.getAttribute('data-state');

        if (stateKey === null)
            return;

        this.setState({ [stateKey]: e.currentTarget.value });
    }

    render() {
        let customStyle = {display: this.state.custom ? 'block' : 'none' };
        let defaultStyle = {display: !this.state.custom ? 'block' : 'none' };

        return (
            <div className="source-input">
                <div className="text-center">
                    <div className="btn-group btn-group-toggle btn-group-sm mb-2" data-toggle="buttons">
                        <label className="btn btn-secondary active">
                            <input type="radio" name="options" data-custom="false"  onClick={this.handleCustomChange} defaultChecked={!this.state.custom} /> Habbo
                        </label>
                        <label className="btn btn-secondary">
                            <input type="radio" name="options" data-custom="true" onClick={this.handleCustomChange} defaultChecked={this.state.custom} /> Custom
                        </label>
                    </div>
                </div>

                <div style={defaultStyle} className="text-center">
                    <Select value={this.state.hotel} items={OFFICIAL_HOTELS} onChange={this.handleHotelChange} className="form-control mb-3 form-control-sm d-block w-50 mx-auto" />
                    <InfoBox />
                </div>

                <div style={customStyle}>
                    <div className="form-group text-center">
                        <label className="control-label">Source external variables</label>

                        <input className="form-control form-control-sm input-sm form-url-input" 
                               data-state="customExternalVariables" 
                               onChange={this.handleChange} 
                               type="text" 
                               placeholder="https:/example.com/gamedata/external_variables" />

                        <p className="mt-2"><small>If the external variable file is missing values, you'll need to fill them out manually in advances settings.</small></p>
                    </div>
                    <div className="spoiler card card-default">
                        <div className="spoiler-btn card-header text-center" onClick={this.handleSpoilerClick}>Advanced settings</div>
                        <div className="spoiler-body card-body collapse pt-1 text-center">
                            <p><small>You don't have to fill out everything, just the missing or incorrect values.</small></p>
                            <div className="form-group">
                                <div><label className="control-label">Source figuredata</label></div>
                                <input className="form-control form-control-sm input-sm form-url-input" 
                                        data-state="sourceFiguredataUrl" 
                                        onChange={this.handleChange} 
                                        type="text" 
                                        placeholder="Insert URL here..." />
                            </div>
                            <div className="form-group">
                                <div><label className="control-label">Source figuremap</label></div>
                                <input className="form-control form-control-sm input-sm form-url-input" 
                                        data-state="sourceFiguremapUrl" 
                                        onChange={this.handleChange} 
                                        type="text" 
                                        placeholder="Insert URL here..." />
                            </div>
                            <div className="form-group">
                                <div><label className="control-label">Source furnidata</label></div>
                                <input className="form-control form-control-sm input-sm form-url-input" 
                                        data-state="sourceFurnidataUrl" 
                                        onChange={this.handleChange} 
                                        type="text" 
                                        placeholder="Insert URL here..." />
                            </div>
                            <div className="form-group">
                                <label className="control-label">HOF Furni URL</label>
                                <input className="form-control form-control-sm input-sm form-url-input" 
                                        data-state="hofFurniUrl" 
                                        onChange={this.handleChange} 
                                        type="text" 
                                        placeholder="Insert URL here..." />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Production folder URL</label>
                                <input className="form-control form-control-sm input-sm form-url-input" 
                                        data-state="productionUrl" 
                                        onChange={this.handleChange} 
                                        type="text" 
                                        placeholder="Insert URL here..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SourceInput;