import React, { Component } from 'react';
import FileChooser from '../FileChooser';
import NumberInput from './NumberInput';

import $ from 'jquery';

class UserInputs extends Component {
    constructor(props) {
        super(props);

        this.figuredataInput = React.createRef();
        this.figuremapInput = React.createRef();

        this.state = {
            itemsBase: '',
            catalogItems: ''
        }
    }

    sqlTooltip = "Select the starting ID for items in database, otherwise default furniture IDs will be used.";

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    getOptions = async (options) => {
        if (!options) {
            options = {};
        }

        let figuredata = await this.figuredataInput.current.getContent();
        let figuremap = await this.figuremapInput.current.getContent();

        if (figuredata.empty || figuremap.empty) {
            return `Please select a ${(figuredata.empty) ? 'figuredata' : 'figuremap' } ${(figuredata.isFile) ? 'file'  : 'url' }!`;
        }

        options[(figuredata.isFile) ? "destFiguredata" : "destFiguredataUrl"] = figuredata.content;
        options[(figuremap.isFile) ? "destFiguremap" : "destFiguremapUrl"] = figuremap.content;

        options["itemsBaseOffset"] = Number(this.state.itemsBase) || undefined;
        options["catalogPageId"] = Number(this.state.catalogItems) || undefined;

        return options;
    }

    handleChange = (name, value) => {
        this.setState({ [name]: value });
    }

    render() {
        return (
            <div className="user-clothing-inputs text-center">
                <h5 className="font-weight-bold">Your files</h5>

                <div className="form-group required">
                    <label className="control-label d-block">Figuredata</label>
                    <FileChooser name="figuredata" ref={this.figuredataInput} urlAllowed={false} />
                </div>

                <div className="form-group required">
                    <label className="control-label d-block">Figuremap</label>
                    <FileChooser name="figuremap" ref={this.figuremapInput} urlAllowed={false} />
                </div>

                <div className="form-group mt-3">
                    <label className="control-label d-block">
                        SQL Settings <i className="fa fa-info-circle fa-blue" title={this.sqlTooltip} data-toggle="tooltip"></i>
                    </label>
                    <div className="narrow-form-group">
                        <NumberInput 
                            name="itemsBase" 
                            label="items_base" 
                            placeholder="ID Offset (optional)"
                            onChange={this.handleChange} />

                        <NumberInput 
                            name="catalogItems" 
                            label="catalog_items" 
                            placeholder="Page ID (optional)"
                            className="mt-3" 
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
}

export default UserInputs;