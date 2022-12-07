import React, { Component } from 'react';
import { bool, string, number } from 'prop-types';

class LoadingDisplay extends Component {
    render() {
        let percentageStyle = {display: (this.props.percentage !== undefined && !isNaN(this.props.percentage)) ? "inline" : "none"};

        return (
            <div className="loading-display" style={{display: this.props.active ? "block" : "none" }}>
                { this.props.info } 
                <span className="ml-2" style={percentageStyle}>
                    ({Math.round(this.props.percentage * 100)}%)
                </span>
            </div>
        );
    }
}

LoadingDisplay.propTypes = {
    active: bool.isRequired,
    info: string.isRequired,
    percentage: number
}

export default LoadingDisplay;