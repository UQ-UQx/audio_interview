import React, { Component } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

const Container = styled.div``;
class InterviewStructure extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <Container>Interview Structure Settings</Container>;
    }
}
export default withRouter(
    connect(
        state => ({
            test: state.save,
        }),
        {}
    )(InterviewStructure)
);
