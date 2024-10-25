import { ITask, TaskState, taskStates, taskTypes } from "./config/constants";


class Queue {
    private data: ITask[];
    constructor() {
        this.data = [];
    }

    add(newTask: ITask) {

        if (this.isEmpty()) {
            this.data.push(newTask);
        } else {
            let added = false;
            for (let i = 0; i < this.data.length; i++) {
                if (newTask.priority > this.data[i].priority) {
                    this.data.splice(i, 0, newTask);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.data.push(newTask);
            }
        }
    }

    getFirstPending(i = 0): ITask | undefined {
        if (this.isEmpty()) {
            console.log("Queue is empty")
            return;
        }

        while (!this.hasInProgress()) {
            if (this.data[i] && this.data[i].state === taskStates.pending) {
                return this.data[i];
            }
            i++;
            if (i > this.data.length) return;
        }
    }

    hasInProgress(): boolean {
        return this.data.some((task: any) => task.state === taskStates.inprogress);
    }

    private isEmpty(): boolean {
        return this.data.length === 0;
    }

    printQueue(): void {
        // console.clear()
        console.log(`\n\n ${this.data.map(task => JSON.stringify(task)).join('\n')}`)
    }
    private hasPendingFullSync(): boolean {
        return this.data.some((task: any) => task.taskType === taskTypes.fullSync && task.state === taskStates.pending);
    }
    updateState(updatedTask: any, newState: TaskState): void {
        const index = this.data.findIndex((task: any) => task.taskId === updatedTask.taskId);

        if (this.hasPendingFullSync()) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].state === taskStates.pending && this.data[i].taskType === taskTypes.regular) {
                    this.data[i].state = taskStates.canceled
                }
            }
        }

        if (index !== -1 && (["pending", "inprogress"] as Array<TaskState>).includes(this.data[index].state)) {
            this.data[index].state = newState;
        }
    }
}
export default new Queue();



// Reliable Queues
// In a basic queue, if a consumer crashes after dequeuing a task but before processing it, that task is lost. To prevent such data loss, Redis provides a pattern for reliable queues. In a reliable queue, a task is not removed from the queue immediately when it is dequeued. Instead, it is moved to a temporary queue where it is stored until the consumer confirms that the task has been processed.