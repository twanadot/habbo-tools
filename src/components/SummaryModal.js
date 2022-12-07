import React, { Component } from 'react';
import $ from "jquery";

export default class SummaryModal extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            summary: (props.summary) ? props.summary : `No changes were made.`
        }
    }

    showModal = (summary) => {
        if (summary) {
            this.setState({summary: summary});
        }

        $("#summaryModal").modal("show");
    }

    onDismiss = () => {
        if (this.props.onDismiss) {
            this.props.onDismiss();
        }
    }

    render() { return (
        <div className="modal fade summary-modal" tabIndex="-1" role="dialog" id="summaryModal" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Summary</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.onDismiss}>
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body" dangerouslySetInnerHTML={{ __html: this.state.summary.replace(/\n/g, "<br />") }}>     
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.onDismiss}>Close</button>
                </div>
                </div>
            </div>
        </div>
    )}
}