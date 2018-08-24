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
        this.onAddQuestion = this.onAddQuestion.bind(this);
        this.onAddGroup = this.onAddGroup.bind(this);
        this.groupOnChange = this.groupOnChange.bind(this);
    }

    onAddQuestion() {
        const { stateHandler, groups } = this.props;

        stateHandler({
            groups: [
                ...groups,
                {
                    id: uuidv4(),
                    name: '',
                    questions: [
                        ...groups.questions,
                        {
                            id: uuidv4(),
                            question: '',
                        },
                    ],
                },
            ],
        });
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
                        },
                    ],
                },
            ],
        });
    }

    groupOnChange(id, type, details) {
        const { stateHandler, groups } = this.props;

        switch (type) {
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

                            return {
                                ...group,
                                questions: [
                                    ...questions,
                                    {
                                        id: uuidv4(),
                                        question: '',
                                    },
                                ],
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

                            return {
                                ...group,
                                questions: [
                                    ...questions.filter(
                                        question => question.id !== details.id
                                    ),
                                ],
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
