import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { convertGroupsToQuestionsList } from '../helpers';

const Container = styled.div``;

class InterviewStructure extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { groups } = this.props;
        const questionsList = convertGroupsToQuestionsList(groups);

        return (
            <Container>
                <h4>
                    The following is a possible list of questions that the
                    lerner will see in order:
                </h4>

                {questionsList.map(question => (
                    <div key={question.id}>
                        {question.question} - {question.settings.time / 1000}{' '}
                        minutes
                    </div>
                ))}
            </Container>
        );
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

InterviewStructure.propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};
