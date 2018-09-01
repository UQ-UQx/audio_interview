import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { sampleSize } from 'lodash';

const Container = styled.div``;

const convertGroupsToQuestionsList = groups => {
    // go through the groups 1by one, read the group settings first, and then grab the questions,

    const list = groups.map(group => {
        const { settings, questions } = group;

        let list = [];

        if (settings.randomise) {
            list = questions.map(question => {
                if (question.settings.ask)
                    return { question, time: question.settings.time };
                return false;
            });
        } else {
            const { numberOfQuestionsToAsk } = settings;

            console.log('wow', sampleSize(questions, numberOfQuestionsToAsk));
        }

        return [...list];
    });

    console.log(list);
    return [...groups];
};

class InterviewStructure extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { groups } = this.props;
        return (
            <Container>
                <pre>
                    {JSON.stringify(
                        convertGroupsToQuestionsList(groups),
                        null,
                        2
                    )}
                </pre>
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
