import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { convertGroupsToQuestionsList } from '../helpers';

const Container = styled.div``;

class InterviewStructure extends Component {
    constructor(props) {
        super(props);
        const { groups } = props;

        this.state = {
            questionsList: convertGroupsToQuestionsList(groups),
        };
    }

    render() {
        const { questionsList } = this.state;
        const { groups } = this.props;

        return (
            <Container>
                <h4>
                    The following is a possible list of questions that the
                    lerner will see in order:
                </h4>
                <Button
                    size="sm"
                    onClick={() => {
                        this.setState({
                            questionsList: convertGroupsToQuestionsList(groups),
                        });
                    }}
                >
                    <FontAwesomeIcon icon="sync-alt" /> Refresh
                </Button>
                {questionsList.map((question, index) => {
                    const { time } = question.settings;

                    const computedTime = moment.duration(time * 1000);

                    // console.log(computedTime);

                    return (
                        <div key={question.id}>
                            {index + 1}) {question.question} -{' '}
                            <b>
                                {`${computedTime.minutes()} Minutes ${computedTime.seconds()} Seconds`}
                            </b>
                        </div>
                    );
                })}
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
