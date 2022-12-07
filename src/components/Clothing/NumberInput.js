import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NumberInput extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            value: (this.props.value) ? this.props.value : ''
        }
    }

    handleChange = (e) => {
        this.setState({value: e.currentTarget.value});

        if (this.props.onChange) {
            if (this.props.name) {
                this.props.onChange(this.props.name, e.currentTarget.value);
                return;
            }

            this.props.onChange(e.currentTarget.value);
        }
    }

    getValue = () => {
        return this.state.value;
    }

    render() {
        let placeholder = (this.props.placeholder) ? this.props.placeholder : "";
        let className = (this.props.className) ? " " + this.props.className : "";
        let prepend = "";

        if (this.props.label) {
            prepend = (
                <div className="input-group-prepend">
                    <span className="input-group-text">{this.props.label}</span>
                </div>
            );
        }

        return (
            <div className={"input-group input-group-sm input-group-dark" + className}>
                {prepend}
                <input type="number" className="form-control" value={this.state.value} onChange={this.handleChange} placeholder={placeholder} />
            </div>
        );
    }
}

NumberInput.propTypes = {
    value: PropTypes.number,
    label: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string
}

export default NumberInput;