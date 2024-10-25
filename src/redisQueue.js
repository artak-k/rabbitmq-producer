const redis = require('redis')

const tasks = [
    {
        "taskType": "regular",
        "priority": 2,
        "content": {
            "task": {
                "user": {
                    "name": "First",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 2,
        "content": {
            "task": {
                "user": {
                    "name": "Second",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 2,
        "content": {
            "task": {
                "user": {
                    "name": "third",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 1,
        "content": {
            "task": {
                "user": {
                    "name": "fourth",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 5,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "full-sync",
        "priority": 6,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 7,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 7,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 7,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 8,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 71,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    },
    {
        "taskType": "regular",
        "priority": 17,
        "content": {
            "task": {
                "user": {
                    "name": "John",
                    "age": 20
                }
            }
        }
    }
]

class RedisSortedSetQueue {
    constructor(queueName) {
        this.queueName = queueName
        this.tempQueueName = `temp-${queueName}`
        this.redisClient = null
    }
    async init() {
        try {
            this.redisClient = redis.createClient();

            this.redisClient.on('error', (error) => {
                console.error('Redis connection error: ', error);
            });

            await this.redisClient.connect();
            console.log('🚀 Redis connected successfully');
        } catch (error) {
            console.error('Error initializing Redis: ', error.message);

        }
    }

    async enqueue(task, queueName = this.queueName) {
        try {
            let score, value;
            if (queueName === this.queueName) {
                score = task.priority
                value = JSON.stringify(task)
            } else {
                score = task.score
                value = task.value
            }
            await this.redisClient.zAdd(queueName, { score, value })
            console.log(`Enqueued: ${value} with priority: ${score}`);
        } catch (error) {
            console.error('Error enqueuing task: ', error.message);
        }
    }

    async dequeue(queueName = this.queueName) {
        try {
            const task = await this.redisClient.zPopMax(queueName)
            if (!task) {
                console.log('Queue is empty.');
                return
            }
            if (queueName !== this.tempQueueName) {
                await this.moveTo(this.tempQueueName, task)
            }

            console.log(`\n\n\n Dequeued: ${JSON.stringify(task)}`);
            return task
        } catch (error) {
            console.error('Error dequeuing task: ', error.message);
        }
    }


    async moveTo(to, task) {
        try {
            await this.enqueue(task, to);

            console.log(`Moved task: ${task.value} from ${this.queueName} to ${to}`);
        } catch (error) {
            console.error('Error moving task: ', error.message);
        }
    }

    async getAll(queueName = this.queueName) {
        try {
            const task = await this.redisClient.zRange(queueName, 0, -1);
            return task.map(task => JSON.parse(task))
        } catch (error) {
            console.error('Error dequeuing task: ', error.message);
        }
    }

    async getSize(queueName = this.queueName) {
        try {
            const task = await this.redisClient.zCard(queueName);
            return task
        } catch (error) {
            console.error('Error dequeuing task: ', error.message);
        }
    }

    async peek(queueName = this.queueName) {
        try {
            const task = await this.redisClient.zRangeWithScores(queueName, -1, -1);
            if (task.length) {
                return JSON.parse(task[0].value);
            } else {
                console.log('Queue is empty.');
                return null;
            }
        } catch (error) {
            console.error('Error peeking task: ', error.message);
        }
    }

    async cleanQueue(queueName = this.tempQueueName) {
        try {
            const result = await this.redisClient.del(queueName);
            if (result) {
                console.log(`Queue ${queueName} cleaned up successfully.`);
            } else {
                console.log(`Queue ${queueName} does not exist.`);
            }
        } catch (error) {
            console.error(`Error cleaning queue ${queueName}: `, error.message);
        }
    }
    async removeFromTemp() {
        try {
            await this.dequeue(this.tempQueueName)
        } catch (error) {
            console.error('Error dequeuing task: ', error.message);
        }
    }
};


(async (queue) => {
    await queue.init()

    for (let task of tasks) {
        await queue.enqueue(task)
    }

    const all = await queue.getAll()
    const size = await queue.getSize()
    const temp = await queue.getAll('temp-test-queue')

    console.log('All: ', all)
    console.log('Size: ', size)
    console.log('Temp: ', temp)
    await queue.dequeue()
    await clearTemp(queue, `temp-test-queue`)

    // await queue.cleanQueue()
})(new RedisSortedSetQueue('test-queue'))

async function clearTemp(queue, queueName) {
    const size = await queue.getSize(queueName)
    if (!size) return
    await queue.dequeue()
    console.log(size)
    return new Promise((resolve, _reject) => {
            clearTemp(queue, queueName)
         return   resolve(queue.dequeue(queueName))
    })
}