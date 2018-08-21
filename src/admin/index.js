import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { setSaveFalse } from '../actions';

const Container = styled.div`
    padding: 20px;
    border: 1px solid lightblue;
`;

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.save = this.save.bind(this);
    }

    componentDidMount() {
        const { setSaveFalse } = this.props;
        setSaveFalse();
    }

    componentDidUpdate() {
        const { save } = this.props;
        if (save) this.save();
    }

    save() {
        const { history } = this.props;

        history.push('/');
    }

    render() {
        return <Container>Settings Page:</Container>;
    }
}

export default withRouter(
    connect(
        state => ({
            save: state.save,
        }),
        { setSaveFalse }
    )(Admin)
);

Admin.propTypes = {
    save: PropTypes.bool.isRequired,
    setSaveFalse: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
};
