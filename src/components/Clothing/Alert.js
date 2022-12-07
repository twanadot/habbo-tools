import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Alert extends Component {
    render() {
        return (
            <div className="alert alert-danger text-center" style={{display: this.props.error === '' ? 'none' : 'block' }} role="alert">
                { this.props.error }
            </div>
        );
    }
}

Alert.propTypes = {
    error: PropTypes.string.isRequired
}

export default Alert;