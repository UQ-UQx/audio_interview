import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
    Input,
    Button,
    InputGroup,
    InputGroupAddon,
    NavbarBrand,
    Navbar,
    Collapse,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    CardBody,
    Card,
    Form,
    FormGroup,
    Label,
    InputGroupText,
} from 'reactstrap';
import { Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCog, faBars } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
    margin-bottom: 10px;
    background-color: #eaeaea;
    padding: 10px;
`;

const AddQuestionButton = styled(Button)`
    margin-top: 5px;
`;

const QuestionInputGroup = styled(InputGroup)`
    margin-bottom: 5px;
`;

const GroupTopBar = styled.div`
    text-align: right;
    background-color: #6c6c6c;
    width: 100%;
`;

const RemoveGroupLink = styled(NavLink)`
    cursor: pointer;
    color: #e30101 !important;
`;

const GroupSettingsLink = styled(NavLink)`
    cursor: pointer;
`;

const DraggableContainer = styled.div``;

const DragHandle = styled.div`
    margin-right: 20px;
`;

class GroupAdmin extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
        };
    }

    toggle() {
        const { isOpen } = this.state;
        this.setState({
            isOpen: !isOpen,
        });
    }

    render() {
        const {
            id,
            index,
            // name,
            questions,
            settings,
            onChangeHandler,
        } = this.props;

        const { isOpen } = this.state;

        const numberOfQuestionsThatWantToBeAsked = questions.filter(
            question => question.settings.ask
        ).length;

        const options = [];

        for (let i = 0; i < numberOfQuestionsThatWantToBeAsked; i++) {
            options.push(
                <option
                    key={`${id}_numberOfQuestionsThatWantToBeAsked_option_${i}`}
                    value={i + 1}
                >
                    {i + 1}
                </option>
            );
        }

        console.log(settings, numberOfQuestionsThatWantToBeAsked);

        return (
            <Draggable
                key={id}
                draggableId={id}
                index={index}
                tab-index={index}
            >
                {provided => (
                    <DraggableContainer
                        innerRef={provided.innerRef}
                        {...provided.draggableProps}
                    >
                        <GroupTopBar>
                            <Navbar color="light" light expand="md">
                                <DragHandle {...provided.dragHandleProps}>
                                    <FontAwesomeIcon icon={faBars} />
                                </DragHandle>
                                <NavbarBrand>Question Group</NavbarBrand>
                                <NavbarToggler onClick={this.toggle} />
                                <Collapse isOpen={isOpen} navbar />
                                <Nav className="ml-auto" navbar>
                                    <NavItem>
                                        <GroupSettingsLink
                                            color="info"
                                            onClick={this.toggle}
                                        >
                                            <FontAwesomeIcon icon={faCog} />
                                            {'  '}
                                            Group Settings
                                        </GroupSettingsLink>
                                    </NavItem>
                                    <NavItem />
                                </Nav>
                            </Navbar>
                        </GroupTopBar>
                        <Collapse isOpen={isOpen}>
                            <Card>
                                <CardBody>
                                    <Form>
                                        <FormGroup check>
                                            <Label check>
                                                <Input
                                                    type="checkbox"
                                                    checked={settings.randomise}
                                                    onChange={() => {
                                                        onChangeHandler(
                                                            id,
                                                            'updateGroupSettings',
                                                            {
                                                                randomise: !settings.randomise,
                                                            }
                                                        );
                                                    }}
                                                />{' '}
                                                Randomise Questions
                                            </Label>
                                        </FormGroup>
                                        <FormGroup />
                                        {settings.randomise ? (
                                            <FormGroup>
                                                <Label for="exampleSelect">
                                                    Number of questions to
                                                    randomise (out of the
                                                    enabled pool of questions
                                                    for this group)
                                                </Label>
                                                <Input
                                                    type="select"
                                                    name="select"
                                                    id="exampleSelect"
                                                    value={
                                                        settings.numberOfQuestionsToAsk
                                                    }
                                                    onChange={event => {
                                                        console.log(
                                                            event.target.value
                                                        );
                                                        onChangeHandler(
                                                            id,
                                                            'updateGroupSettings',
                                                            {
                                                                numberOfQuestionsToAsk: parseInt(
                                                                    event.target
                                                                        .value,
                                                                    10
                                                                ),
                                                            }
                                                        );
                                                    }}
                                                >
                                                    <option
                                                        key={`${id}_numberOfQuestionsThatWantToBeAsked_option_${0}`}
                                                        value={0}
                                                    >
                                                        {0}
                                                    </option>
                                                    {options}
                                                </Input>
                                            </FormGroup>
                                        ) : (
                                            ''
                                        )}
                                    </Form>
                                    <hr />
                                    <RemoveGroupLink
                                        color="danger"
                                        onClick={() =>
                                            onChangeHandler(id, 'removeGroup')
                                        }
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        {'  '}
                                        Remove Group
                                    </RemoveGroupLink>
                                </CardBody>
                            </Card>
                        </Collapse>
                        <Container>
                            {questions.map(question => (
                                <QuestionInputGroup
                                    key={`${id}_${question.id}`}
                                >
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <Input
                                                checked={question.settings.ask}
                                                onChange={() => {
                                                    let numberToAsk = 0;

                                                    const numberOfQuestionsThatWantToBeAsked = questions.filter(
                                                        questionb => {
                                                            if (
                                                                question.id ===
                                                                questionb.id
                                                            ) {
                                                                return !question
                                                                    .settings
                                                                    .ask;
                                                            }
                                                            return questionb
                                                                .settings.ask;
                                                        }
                                                    ).length;

                                                    console.log(
                                                        settings.numberOfQuestionsToAsk,
                                                        numberOfQuestionsThatWantToBeAsked
                                                    );
                                                    if (
                                                        settings.numberOfQuestionsToAsk >
                                                        numberOfQuestionsThatWantToBeAsked
                                                    ) {
                                                        numberToAsk = numberOfQuestionsThatWantToBeAsked;
                                                    } else {
                                                        numberToAsk =
                                                            settings.numberOfQuestionsToAsk;
                                                    }
                                                    onChangeHandler(
                                                        id,
                                                        'updateQuestionAskSetting',
                                                        {
                                                            id: question.id,
                                                            settings: {
                                                                ask: !question
                                                                    .settings
                                                                    .ask,
                                                            },
                                                            groupSettings: {
                                                                numberOfQuestionsToAsk: numberToAsk,
                                                            },
                                                        }
                                                    );
                                                }}
                                                addon
                                                type="checkbox"
                                                aria-label="Checkbox for following text input"
                                            />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        name={`${id}_${
                                            question.id
                                        }_question_input`}
                                        placeholder="Please Write Your Question Here..."
                                        onChange={event =>
                                            onChangeHandler(
                                                id,
                                                'updateQuestion',
                                                {
                                                    id: question.id,
                                                    event,
                                                }
                                            )
                                        }
                                        value={question.question}
                                    />{' '}
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            color="danger"
                                            onClick={() =>
                                                onChangeHandler(
                                                    id,
                                                    'removeQuestion',
                                                    {
                                                        id: question.id,
                                                    }
                                                )
                                            }
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </InputGroupAddon>
                                </QuestionInputGroup>
                            ))}
                            <AddQuestionButton
                                color="info"
                                size="sm"
                                onClick={() =>
                                    onChangeHandler(id, 'addQuestion')
                                }
                            >
                                Add Question
                            </AddQuestionButton>
                        </Container>
                    </DraggableContainer>
                )}
            </Draggable>
        );
    }
}

export default GroupAdmin;

GroupAdmin.propTypes = {
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    // name: PropTypes.string.isRequired,
    questions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    settings: PropTypes.shape().isRequired,
    onChangeHandler: PropTypes.func.isRequired,
};
