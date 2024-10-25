import { createClient, RedisClientType } from 'redis';
import { taskStates } from './constants';

class RedisPriorityQueue {
    private redisClient: RedisClientType | null;
    queueName: string
    tempQueueName: string
    private connected: boolean = false;
    constructor(queueName: string) {
        this.queueName = queueName
        this.tempQueueName = `temp-${queueName}`
        this.redisClient = null

    }
    private async ensureConnection(): Promise<void> {
        if (this.connected && this.redisClient) return;
        await this.init();

    }

    async init() {
        try {
            this.redisClient = createClient();

            this.redisClient.on('error', (error) => {
                console.error('Redis connection error: ', error);
            });

            await this.redisClient.connect();
            console.log('🚀 Redis connected successfully');
            this.connected = true;

            await this.cleanQueue()
            await this.cleanQueue(this.tempQueueName)
        } catch (error: any) {
            console.error('Error initializing Redis: ', error.message);

        }
    }

    async enqueue(task: any, queueName = this.queueName) {
        await this.ensureConnection()
        try {

            if (!this.redisClient) {
                console.error('Redis client is not initialized.');
                return;
            }
            let score, value;
            if (queueName === this.queueName) {
                score = task.priority
                value = JSON.stringify(task)

            } else {
                score = task.score
                value = task.value
            }
            await this.redisClient.zAdd(queueName, { score, value })

        } catch (error: any) {
            console.error('Error enqueuing task: ', error.message);
        }
    }

    async dequeue(queueName = this.queueName, force: boolean = false) {
        await this.ensureConnection()
        try {
            if (!this.redisClient) {
                console.error('Redis client is not initialized.');
                return;
            }
            let task = await this.redisClient.zPopMax(queueName)
            if (!task) {
                console.log('Queue is empty.');
                return
            }
            if (queueName !== this.tempQueueName) {
                task.value = JSON.stringify({ ...JSON.parse(task.value), state: force ? taskStates.canceled : taskStates.inprogress })
                if (!force) {
                    await this.moveTo(this.tempQueueName, task)
                } else {
                    console.log(`Task canceled: ${task.value}`)
                }
            }

            return task
        } catch (error: any) {
            console.error('Error dequeuing task: ', error.message);
        }
    }


    async moveTo(to: string, task: any) {
        try {
            await this.enqueue(task, to);

        } catch (error: any) {
            console.error('Error moving task: ', error.message);
        }
    }

    async getSize(queueCode: 1 | 0) {
        await this.ensureConnection()
        const queueName = queueCode === 1 ? this.queueName : this.tempQueueName
        try {
            if (!this.redisClient) {
                console.error('Redis client is not initialized.');
                return;
            }
            const task = await this.redisClient.zCard(queueName);
            return task
        } catch (error: any) {
            console.error('Error dequeuing task: ', error.message);
        }
    }

    async peek(queueCode: 1 | 0) {
        await this.ensureConnection()
        const queueName = queueCode === 1 ? this.queueName : this.tempQueueName
        try {
            if (!this.redisClient) {
                console.error('Redis client is not initialized.');
                return;
            }
            const task = await this.redisClient.zRangeWithScores(queueName, -1, -1);
            if (task.length) {
                return JSON.parse(task[0].value);
            } else {
                console.log('Queue is empty.');
                return null;
            }
        } catch (error: any) {
            console.error('Error peeking task: ', error.message);
        }


    }

    async cleanQueue(queueName = this.tempQueueName) {
        await this.ensureConnection()
        try {
            if (!this.redisClient) {
                console.error('Redis client is not initialized.');
                return;
            }
            const result = await this.redisClient.del(queueName);
            if (result) {
                console.log(`Queue ${queueName} cleaned up successfully.`);
            } else {
                console.log(`Queue ${queueName} does not exist.`);
            }
        } catch (error: any) {
            console.error(`Error cleaning queue ${queueName}: `, error.message);
        }
    }
}

const redisPriorityQueue = new RedisPriorityQueue('task-queue');

export default redisPriorityQueue;