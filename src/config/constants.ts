export const actions = {
    taskCreate: "task-create",
    taskSend: 'task-send',
    taskGet: 'task-get'
} as const;

export const prefixes = {
    task: "task"
} as const;

export const taskStates = {
    pending: "pending",
    inprogress: "inprogress",
    completed: "completed",
    canceled: "canceled"
} as const;

export const taskTypes = {
   regular: 'regular',
   fullSync: 'full-sync'
} as const;

export type TaskState = typeof taskStates[keyof typeof taskStates];
export type TaskType = typeof taskTypes[keyof typeof taskTypes];

export interface ITask {
    taskId: string;
    priority: number;
    state: TaskState;
    taskType: TaskType;
    content: any;
}