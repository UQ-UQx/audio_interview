import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { setCountDefault } from '../actions';

const Container = styled.div`
    padding: 20px;
    border: 1px solid lightblue;
`;

const DefaultCountInput = styled.input`
    margin-left: 10px;
`;

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            defaultCount: props.defaultCount,
        };

        this.save = this.save.bind(this);
    }

    componentDidUpdate() {
        const { save } = this.props;
        if (save) this.save();
    }

    save() {
        const { setCountDefault, history } = this.props;
        const { defaultCount } = this.state;
        setCountDefault(parseInt(defaultCount, 10));
        history.push('/');
    }

    render() {
        const { defaultCount } = this.state;
        return (
            <Container>
                Default Count Value:
                <DefaultCountInput
                    type="number"
                    value={defaultCount}
                    onChange={event => {
                        this.setState({
                            defaultCount: event.target.value,
                        });
                    }}
                />
            </Container>
        );
    }
}

export default withRouter(
    connect(
        state => ({
            save: state.save,
            defaultCount: state.defaultCount,
        }),
        { setCountDefault }
    )(Admin)
);

Admin.propTypes = {
    save: PropTypes.bool.isRequired,
    defaultCount: PropTypes.number.isRequired,
    setCountDefault: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
};
