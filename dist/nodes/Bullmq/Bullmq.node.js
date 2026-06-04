"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bullmq = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const utils_1 = require("./utils");
const bullmq_1 = require("bullmq");
const GenericFuntions_1 = require("./GenericFuntions");
class Bullmq {
    constructor() {
        this.description = {
            displayName: 'BullMQ (RedTeam)',
            name: 'bullmqRedteam',
            icon: 'file:bullmq.svg',
            group: ['input'],
            version: 1,
            description: 'Get, send and update data in Redis',
            defaults: {
                name: 'BullMQ',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'redis',
                    required: true,
                    testedBy: 'redisConnectionTest',
                },
            ],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Add',
                            value: 'add',
                            description: 'Add a job to a queue',
                            action: 'Add a job',
                        },
                        {
                            name: 'Get Queue Status',
                            value: 'getQueueStatus',
                            description: 'Get job counts and status of a queue',
                            action: 'Get queue status',
                        },
                    ],
                    default: 'add',
                },
                {
                    displayName: 'Queue Name',
                    name: 'statusQueueName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['getQueueStatus'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'Name of the queue to get status for',
                },
                {
                    displayName: "Queue Source",
                    name: "queueSource",
                    type: "options",
                    options: [
                        {
                            name: "Workflows",
                            value: "workflows",
                        },
                        {
                            name: "Custom",
                            value: "custom",
                        },
                    ],
                    default: "workflows",
                    displayOptions: {
                        show: {
                            operation: ["add"],
                        },
                    },
                },
                {
                    displayName: 'Queue Name',
                    name: 'queueName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['add'],
                            queueSource: ['custom'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'Queue name to add the job to',
                },
                {
                    displayName: "Workflow",
                    name: "workflowId",
                    type: "workflowSelector",
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ["add"],
                            queueSource: ["workflows"],
                        },
                    },
                },
                {
                    displayName: 'Job Name',
                    name: 'jobName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['add'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'Job name to publish',
                },
                {
                    displayName: 'Data Source',
                    name: 'dataSource',
                    type: 'options',
                    displayOptions: {
                        show: {
                            operation: ['add'],
                        },
                    },
                    options: [
                        {
                            name: 'Previous Node',
                            value: 'previousNode',
                            description: 'Get data from previous node',
                        },
                        {
                            name: 'Input',
                            value: 'input',
                            description: 'Use data from the input',
                        },
                    ],
                    default: 'previousNode',
                },
                {
                    displayName: 'Job Data',
                    name: 'jobData',
                    type: 'assignmentCollection',
                    displayOptions: {
                        show: {
                            operation: ['add'],
                            dataSource: ['input'],
                        },
                    },
                    default: {},
                },
                {
                    displayName: 'Wait Until Finished',
                    name: 'waitUntilFinished',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            operation: ['add'],
                        },
                    },
                    default: false,
                    description: 'Whether to wait until the job is finished, Don\'t use this option for long running jobs',
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add option',
                    displayOptions: {
                        show: {
                            operation: ['add'],
                        },
                    },
                    default: {},
                    options: [
                        {
                            displayName: 'timeToLive',
                            name: 'timeToLive',
                            type: 'number',
                            default: 0,
                            description: 'Time in milliseconds before the job should be failed',
                        },
                        {
                            displayName: 'Retunrn Value',
                            name: 'returnValue',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to return the value of the job',
                        },
                        {
                            displayName: 'Delay',
                            name: 'delay',
                            type: 'number',
                            default: 0,
                            description: 'Delay in milliseconds before the job should be processed',
                        },
                        {
                            displayName: 'Priority',
                            name: 'priority',
                            type: 'number',
                            default: 0,
                            description: 'Priority of the jobb, from 1 to any, higher is higher priority',
                        },
                        {
                            displayName: 'Attempts',
                            name: 'attempts',
                            type: 'number',
                            default: 0,
                            description: 'Number of attempts to run the job',
                        },
                        {
                            displayName: 'Backoff',
                            name: 'backoff',
                            type: 'number',
                            default: 0,
                            description: 'Backoff time in milliseconds',
                        },
                        {
                            displayName: 'Lifo',
                            name: 'lifo',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to process the job in LIFO order, otherwise FIFO',
                        },
                        {
                            displayName: 'Remove On Complete',
                            name: 'removeOnComplete',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to remove the job from the queue when it is completed',
                        },
                        {
                            displayName: 'Remove On Fail',
                            name: 'removeOnFail',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to remove the job from the queue when it fails',
                        }
                    ]
                },
            ],
        };
        this.methods = {
            credentialTest: { redisConnectionTest: GenericFuntions_1.redisConnectionTest },
        };
    }
    async execute() {
        const credentials = await this.getCredentials('redis');
        const source = this.getNodeParameter('queueSource', 0, '');
        const connection = (0, utils_1.setupRedisClient)(credentials);
        const operation = this.getNodeParameter('operation', 0);
        const returnItems = [];
        const items = this.getInputData();
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const inputItem = items[itemIndex];
            const item = { json: {}, pairedItem: { item: itemIndex } };
            try {
                if (operation === 'getQueueStatus') {
                    const queueName = this.getNodeParameter('statusQueueName', itemIndex);
                    const queue = await GenericFuntions_1.getQueue.call(this, queueName, { connection });
                    try {
                        const [counts, isPaused] = await Promise.all([
                            queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused', 'prioritized'),
                            queue.isPaused(),
                        ]);
                        item.json = {
                            queue: queueName,
                            isPaused,
                            counts,
                            total: Object.values(counts).reduce((sum, n) => sum + n, 0),
                        };
                    }
                    finally {
                        await queue.close();
                    }
                    returnItems.push({ ...item, pairedItem: { item: itemIndex } });
                }
                else if (operation === 'add') {
                    const workflowInfo = await GenericFuntions_1.getWorkflowInfo.call(this, source, itemIndex);
                    if (!workflowInfo.id) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The workflow did not return an id!`);
                    }
                    const queueName = workflowInfo.id;
                    const jobName = this.getNodeParameter('jobName', itemIndex);
                    const dataSource = this.getNodeParameter('dataSource', itemIndex);
                    const messageData = this.getNodeParameter('jobData', itemIndex, {});
                    const options = this.getNodeParameter('options', itemIndex);
                    const { timeToLive, delay = 0, priority = 1, attempts = 1, backoff = 0, lifo = false, removeOnComplete = false, removeOnFail = false, returnValue = false, } = options;
                    const queue = await GenericFuntions_1.getQueue.call(this, queueName, { connection });
                    const cleanup = async () => {
                        try {
                            await queue.close();
                        }
                        catch (error) {
                            console.log(error);
                        }
                    };
                    const jsonPayload = dataSource === 'previousNode' ?
                        (0, utils_1.parseJson)(inputItem.json, {}) :
                        (0, utils_1.parseAssignmentsCollection)(messageData, {});
                    const job = await queue.add(jobName, jsonPayload, {
                        delay,
                        priority,
                        attempts,
                        backoff,
                        lifo,
                        removeOnComplete,
                        removeOnFail,
                    });
                    job.log(`Job added from executionId ${this.getExecutionId()}`);
                    const waitUntilFinished = this.getNodeParameter('waitUntilFinished', itemIndex);
                    if (waitUntilFinished) {
                        const queueEvents = new bullmq_1.QueueEvents(queueName, { connection });
                        const cleanupQueueEvents = async () => {
                            try {
                                await queueEvents.close();
                            }
                            catch (error) {
                                console.log(error);
                            }
                        };
                        await job.waitUntilFinished(queueEvents, +timeToLive);
                        if (!job.id) {
                            cleanupQueueEvents();
                            cleanup();
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The job did not return an id!`);
                        }
                        const updatedJob = await queue.getJob(job.id);
                        if (updatedJob) {
                            item.json = updatedJob.toJSON();
                        }
                        else {
                            item.json = job.toJSON();
                        }
                        if (returnValue) {
                            item.json = (0, utils_1.craftJobReturnValue)(item.json.returnvalue);
                        }
                        items[itemIndex] = item;
                        returnItems.push(items[itemIndex]);
                        cleanupQueueEvents();
                    }
                    else {
                        item.json = job.toJSON();
                        items[itemIndex] = item;
                        returnItems.push(items[itemIndex]);
                    }
                    cleanup();
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Operace "${operation}" není podporována.`, { itemIndex });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    items[itemIndex] = {
                        json: inputItem.json,
                        error,
                        pairedItem: { item: itemIndex },
                    };
                    returnItems.push(items[itemIndex]);
                }
                else {
                    if (error instanceof n8n_workflow_1.NodeOperationError)
                        throw error;
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, { itemIndex });
                }
            }
        }
        return [returnItems];
    }
}
exports.Bullmq = Bullmq;
//# sourceMappingURL=Bullmq.node.js.map