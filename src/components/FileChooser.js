import React, { Component } from 'react';
import PropTypes from 'prop-types';

class FileChooser extends Component {

    constructor(props) {
        super(props);

        let fileAllowed = (props.fileAllowed !== undefined) ? props.fileAllowed : true;

        this.state = {
            name: props.name,
            filename: '',
            url: !fileAllowed,
            urlAllowed: (props.urlAllowed !== undefined) ? props.urlAllowed : true,
            fileAllowed: fileAllowed
        }
    }
    

    handleFileChange = (e) => {
        let filename = e.target.value.split("\\").pop();
        this.setState({ filename: filename });
    }

    handleUrlChange = (e) => {
        let isUrl = e.target.getAttribute("data-url") === 'true';

        this.setState({ url: isUrl })

        if (this.props.onTypeChange) {
            this.props.onTypeChange(this.state.name, isUrl);
        }
    }
    
    readFile = () => {
        var file = document.getElementById(this.state.name + "-file-input").files[0];

        if (file === undefined) {
            return;
        }

        return new Promise((resolve, reject) => {
            let content = '';
            const reader = new FileReader();

            reader.onloadend = function(e) {
                content = e.target.result;
                resolve(content);
            };

            reader.onerror = function(e) {
                reject(e);
            };

            reader.readAsText(file);
        });
    }

    getUrl = () => {
        return document.getElementById(this.state.name + "-url-input").value;
    }

    getContent = async () => {
        let content = (this.state.url) ? this.getUrl() : await this.readFile();

        if (content === undefined || content === '') {
            return { isFile: !this.state.url, empty: true };
        }

        return { isFile: !this.state.url, empty: false, content: content };
    }

    render() { 
        return (
        <div>
            {(this.state.urlAllowed && this.state.fileAllowed) ? (
                <div className="btn-group btn-group-toggle btn-group-sm mb-2" data-toggle="buttons">
                    <label className="btn btn-secondary active">
                        <input type="radio" name="options" data-url="false"  onClick={this.handleUrlChange} onChange={() => {}} checked={!this.state.url} /> Upload
                    </label>
                    <label className="btn btn-secondary">
                        <input type="radio" name="options" data-url="true" onClick={this.handleUrlChange} onChange={() => {}} checked={this.state.url} /> URL
                    </label>
                </div>
            ) : "" }

            {(this.state.fileAllowed) ? (
            <div style={{display: !this.state.url ? 'block' : 'none' }}>
                <div className="input-group input-group-sm file-chooser">
                    <div className="custom-file">
                        <input type="file" className="custom-file-input input" accept=".xml" id={this.state.name + "-file-input"} onChange={this.handleFileChange} />
                        <label className="custom-file-label text-left" htmlFor="inputGroupFile01">
                            { (this.state.filename !== '') ? this.state.filename : "Choose file" }
                        </label>
                    </div>
                </div>
            </div>
            ) : "" }

            {(this.state.urlAllowed) ? (
                <div style={{display: this.state.url ? 'block' : 'none' }}>
                    <input className="form-control form-control-sm input-sm form-url-input" id={this.state.name + "-url-input"} type="text" placeholder="Insert URL here..." />
                </div>
            ) : "" }
        </div>
    )}
}

FileChooser.propTypes = {
    name: PropTypes.string,
    onTypeChange: PropTypes.func,
    urlAllowed: PropTypes.bool,
    fileAllowed: PropTypes.bool
}

export default FileChooser;
