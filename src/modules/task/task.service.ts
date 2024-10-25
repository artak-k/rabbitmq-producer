import { Notification } from "../../utils/notification"
import { actions, ITask, TaskState, taskStates, taskTypes } from "../../config/constants"
import config from "../../config/config"
import PriorityQueue from '../../queue'
import redisPriorityQueue from "../../config/redisPriorityQueue"


class TaskService {
    static async reply(data: ITask, taskId: string): Promise<ITask> {
        data.taskId = taskId
        data.state = taskStates.pending as TaskState
        PriorityQueue.add(data)

        if (!PriorityQueue.hasInProgress()) {
            await this.send();
        }

        return data
    }

    static async send(): Promise<any> {
        const data = PriorityQueue.getFirstPending()
        if (!data) return
        this.updateQueueData(data, taskStates.pending)
        const notification = { action: actions.taskSend, data }
        return new Promise((resolve, _reject) => {
            Notification.send(notification, data.taskId, config.NOTIFICATION_QUEUE.queue).then((result: any) => {
                console.log(result.data.state, 'result.data')
                PriorityQueue.updateState(result.data, result.data.state)
                resolve(data)
            })
        })
    }

    static async updateQueueData(data: ITask, state: TaskState): Promise<any> {
        PriorityQueue.updateState(data, state)
        PriorityQueue.printQueue();

        return state === taskStates.completed && new Promise((resolve) => this.send().then(resolve))
    }



    static async reply2(data: ITask, taskId: string): Promise<ITask> {
        data.taskId = taskId
        data.state = taskStates.pending as TaskState
        console.log('\n\nDATA: ', data)

        await redisPriorityQueue.enqueue(data)

        if (data.taskType === taskTypes.fullSync) {
            await this.cancelAll()
        }

        await this.next();

        return data
    }


    static async send2(): Promise<any> {
        const data = await redisPriorityQueue.dequeue()
        if (!data) return
        const size = await redisPriorityQueue.getSize(0)
        if (!size) return
        const taskId = JSON.parse(data.value).taskId
        const notification = { action: actions.taskSend, data }

        return new Promise((resolve, _reject) => {
            Notification.send(notification, taskId, config.NOTIFICATION_QUEUE.queue).then((result: any) => resolve(data))
        })
    }
    static async next() {
        if (!(await redisPriorityQueue.getSize(0))) {
            this.send2()
        }
    }
    static async updateQueueData2(data: ITask, state: TaskState): Promise<any> {
        console.log('\n\nDATA: ', data)

        return state === taskStates.completed && new Promise((resolve) => redisPriorityQueue
            .dequeue(redisPriorityQueue.tempQueueName)
            .then(resolve)
            .then(() => this.next())
        )
    }

    static async cancelAll() {
        while (await redisPriorityQueue.getSize(1)) {
            await redisPriorityQueue.dequeue(redisPriorityQueue.queueName, true)
        }
    }

}

export default TaskService