import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import uuidv4 from 'uuid/v4';
import GroupAdmin from './GroupAdmin';

const Container = styled.div``;

const GroupsContainer = styled.div`
    margin-bottom: 10px;
`;

class QuestionPool extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onAddGroup = this.onAddGroup.bind(this);
        this.groupOnChange = this.groupOnChange.bind(this);
    }

    onAddGroup() {
        const { stateHandler, groups } = this.props;

        stateHandler({
            groups: [
                ...groups,
                {
                    id: uuidv4(),
                    name: '',
                    questions: [
                        {
                            id: uuidv4(),
                            question: '',
                            settings: {
                                ask: true,
                            },
                        },
                    ],
                    settings: {
                        randomise: false,
                        numberOfQuestionsToAsk: 1,
                    },
                },
            ],
        });
    }

    groupOnChange(id, type, details) {
        const { stateHandler, groups } = this.props;

        switch (type) {
            case 'updateGroupSettings':
                stateHandler({
                    groups: groups.map(group => {
                        if (group.id === id) {
                            return {
                                ...group,
                                settings: {
                                    ...group.settings,
                                    ...details,
                                },
                            };
                        }
                        return group;
                    }),
                });
                break;
            case 'updateQuestionAskSetting':
                stateHandler({
                    groups: groups.map(group => {
                        if (group.id === id) {
                            const questions = [...group.questions];

                            const questionToUpdateIndex = questions.findIndex(
                                question => question.id === details.id
                            );

                            const questionToUpdate = questions.filter(
                                question => question.id === details.id
                            )[0];

                            const { settings } = questionToUpdate;

                            questions[questionToUpdateIndex] = {
                                ...questionToUpdate,
                                settings: {
                                    ...settings,
                                    ...details.settings,
                                },
                            };

                            return {
                                ...group,
                                questions: [...questions],
                                settings: {
                                    ...group.settings,
                                    ...(details.groupSettings
                                        ? details.groupSettings
                                        : {}),
                                },
                            };
                        }
                        return group;
                    }),
                });
                break;
            case 'updateQuestion':
                stateHandler({
                    groups: groups.map(group => {
                        if (group.id === id) {
                            const questions = [...group.questions];
                            questions[
                                questions.findIndex(
                                    question => question.id === details.id
                                )
                            ] = {
                                ...questions.filter(
                                    question => question.id === details.id
                                )[0],
                                question: details.event.target.value,
                            };

                            return {
                                ...group,
                                questions: [...questions],
                            };
                        }
                        return group;
                    }),
                });
                break;
            case 'addQuestion':
                stateHandler({
                    groups: groups.map(group => {
                        if (group.id === id) {
                            const questions = [...group.questions];
                            const { settings } = group;
                            const { numberOfQuestionsToAsk } = settings;

                            return {
                                ...group,
                                questions: [
                                    ...questions,
                                    {
                                        id: uuidv4(),
                                        question: '',
                                        settings: {
                                            ask: true,
                                        },
                                    },
                                ],
                                settings: {
                                    ...settings,
                                    numberOfQuestionsToAsk:
                                        numberOfQuestionsToAsk + 1,
                                },
                            };
                        }
                        return group;
                    }),
                });
                break;
            case 'removeQuestion':
                stateHandler({
                    groups: groups.map(group => {
                        if (group.id === id) {
                            const questions = [...group.questions];
                            const { settings } = group;

                            const remainingQuestions = questions.filter(
                                question => question.id !== details.id
                            );

                            const numberOfQuestionsThatWantToBeAsked = remainingQuestions.filter(
                                question => question.settings.ask
                            ).length;

                            return {
                                ...group,
                                questions: [
                                    ...questions.filter(
                                        question => question.id !== details.id
                                    ),
                                ],
                                settings: {
                                    ...settings,
                                    numberOfQuestionsToAsk:
                                        settings.numberOfQuestionsToAsk >
                                        numberOfQuestionsThatWantToBeAsked
                                            ? numberOfQuestionsThatWantToBeAsked
                                            : settings.numberOfQuestionsToAsk,
                                },
                            };
                        }
                        return group;
                    }),
                });
                break;
            case 'removeGroup':
                stateHandler({
                    groups: groups.filter(group => group.id !== id),
                });
                break;
            default:
                break;
        }
    }

    render() {
        const { groups } = this.props;

        return (
            <Container>
                <GroupsContainer>
                    {groups
                        ? groups.map(group => (
                              <GroupAdmin
                                  {...group}
                                  onChangeHandler={this.groupOnChange}
                                  key={group.id}
                              />
                          ))
                        : ''}
                </GroupsContainer>

                <Button color="primary" size="sm" onClick={this.onAddGroup}>
                    Add Question Group
                </Button>
            </Container>
        );
    }
}

export default withRouter(
    connect(
        () => ({}),
        {}
    )(QuestionPool)
);

QuestionPool.propTypes = {
    stateHandler: PropTypes.func.isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};
