import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import uuidv4 from 'uuid/v4';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import GroupAdmin from './GroupAdmin';

const Container = styled.div``;

const GroupsContainer = styled.div`
    margin-bottom: 10px;
`;

const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const questionStructure = () => ({
    id: uuidv4(),
    question: '',
    settings: {
        ask: true,
        time: 10000,
    },
});

class QuestionPool extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.onAddGroup = this.onAddGroup.bind(this);
        this.groupOnChange = this.groupOnChange.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onAddGroup() {
        const { stateHandler, groups } = this.props;

        stateHandler({
            groups: [
                ...groups,
                {
                    id: uuidv4(),
                    name: '',
                    questions: [questionStructure()],
                    settings: {
                        randomise: false,
                        numberOfQuestionsToAsk: 1,
                    },
                },
            ],
        });
    }

    onDragEnd(result) {
        const { source, destination } = result;
        const { groups, stateHandler } = this.props;
        console.log(source, destination, this.props);

        let reorderedGroup = [...groups];
        if (destination) {
            reorderedGroup = [
                ...reorder(groups, source.index, destination.index),
            ];
        }

        stateHandler({ groups: reorderedGroup });
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

                            return {
                                ...group,
                                questions: [...questions, questionStructure()],
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
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable">
                            {provided => (
                                <div ref={provided.innerRef}>
                                    {groups.map((group, index) => (
                                        <GroupAdmin
                                            dragHandleProps={
                                                provided.dragHandleProps
                                            }
                                            {...group}
                                            onChangeHandler={this.groupOnChange}
                                            key={group.id}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
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
