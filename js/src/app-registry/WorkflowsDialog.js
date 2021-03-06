import React from 'react';
import PropTypes from 'prop-types';

import Button, {ButtonGroup} from '@atlaskit/button';
import Modal from '@atlaskit/modal-dialog';
import Spinner from '@atlaskit/spinner';

import OpenIcon from '@atlaskit/icon/glyph/open';
import EditIcon from '@atlaskit/icon/glyph/edit-filled';

import {registryService} from '../service/services';
import {CommonMessages, FieldMessages} from '../i18n/common.i18n';
import {getBaseUrl} from '../service/ajaxHelper';


function getTabForType(type) {
    switch (type) {
        case 'CONDITION':
            return 'conditions';
        case 'VALIDATOR':
            return 'validators';
        case 'FUNCTION':
            return 'postfunctions';
        default:
            return null;
    }
}

function getWorkflowActionLink(workflow, action, item, mode='live') {
    return `${getBaseUrl()}/secure/admin/workflows/ViewWorkflowTransition.jspa?workflowMode=${mode}&workflowName=${encodeURIComponent(workflow.name)}&descriptorTab=${getTabForType(item.type)}&workflowStep=1&workflowTransition=${action.id}`;
}

function getWorkflowLink(workflow, mode='live') {
    return `${getBaseUrl()}/secure/admin/workflows/ViewWorkflowSteps.jspa?workflowMode=${mode}&workflowName=${encodeURIComponent(workflow.name)}`;
}

export class WorkflowsDialog extends React.Component {
    static propTypes = {
        id: PropTypes.number.isRequired,
        onClose: PropTypes.func.isRequired
    };

    state = {
        ready: false,
        workflows: null
    };

    componentDidMount() {
        this.setState({
            ready: false
        });

        registryService
            .getScriptWorkflows(this.props.id)
            .then(workflows => this.setState({
                workflows,
                ready: true
            }));
    }

    render() {
        const {onClose} = this.props;
        const {ready, workflows} = this.state;

        return (
            <Modal
                heading="Workflows with this script"
                width="large"
                actions={[
                    {
                        text: CommonMessages.cancel,
                        onClick: onClose
                    }
                ]}
                onClose={onClose}
            >
                {!ready && <Spinner/>}
                {ready && workflows.length !== 0 &&
                    <table className="aui">
                        <thead>
                            <tr>
                                <td>
                                    {FieldMessages.workflow}
                                </td>
                                <td>
                                    {FieldMessages.action}
                                </td>
                                <td>
                                    {FieldMessages.type}
                                </td>
                                <td>
                                    {FieldMessages.order}
                                </td>
                                <td/>
                                <td/>
                            </tr>
                        </thead>
                        <tbody>
                        {workflows.map(workflow =>
                            workflow.actions.map(action =>
                                action.items.map(item =>
                                    <tr key={`${action.id}-${item.type}-${item.order}`}>
                                        <td>
                                            <ButtonGroup>
                                                <Button
                                                    appearance={workflow.active ? 'link' : 'link-subtle'}
                                                    href={getWorkflowLink(workflow)}
                                                >
                                                    {workflow.name}
                                                </Button>
                                                {workflow.hasDraft && <Button
                                                    appearance="subtle"
                                                    iconBefore={<EditIcon label=""/>}
                                                    href={getWorkflowLink(workflow, 'draft')}
                                                />}
                                            </ButtonGroup>
                                        </td>
                                        <td>
                                            {action.id}{' - '}{action.name}
                                        </td>
                                        <td>
                                            {item.type}
                                        </td>
                                        <td>
                                            {item.order}
                                        </td>
                                        <td>
                                            <Button
                                                appearance="subtle"
                                                iconBefore={<OpenIcon label=""/>}
                                                href={getWorkflowActionLink(workflow, action, item)}
                                            />
                                        </td>
                                        <td>
                                            {workflow.hasDraft && <Button
                                                appearance="subtle"
                                                iconBefore={<EditIcon label=""/>}
                                                href={getWorkflowActionLink(workflow, action, item, 'draft')}
                                            />}
                                        </td>
                                    </tr>
                                )
                            ).reduce((a, b) => a.concat(b))
                        ).reduce((a, b) => a.concat(b))}
                        </tbody>
                    </table>
                }
                {ready && !workflows.length && 'no workflows'}
            </Modal>
        );
    }
}
