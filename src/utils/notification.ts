import ErrorMsgResponse from "../responses/error.message";
import { actions, prefixes } from "../config/constants";
import mqConnection from "../config/rabbitmq.config";
import taskOperations from "../modules/task/task.operations";
import config from "../config/config";

export type INotification = {
    action: string;
    data?: any;
};
const queue: { lastLength: number, data: any } = {
    lastLength: 0,
    data: []
}
type Keys = keyof typeof actions;

interface ParsedData {
    action: typeof actions[Keys];
    data?: any;
}

export class Notification {
    private static promiseMap: Map<string, (value: any) => void> = new Map();

    static async send(notification: INotification, correlationId: string, replyTo: string) {
        if (replyTo === config.NOTIFICATION_QUEUE.queue) {
            await mqConnection.sendToTaskQueue(config.NOTIFICATION_QUEUE.queue, notification, correlationId);

            return new Promise((resolve, _reject) => Notification.promiseMap.set(correlationId, resolve));
        } else {
            await mqConnection.sendToQueue(replyTo, notification, correlationId);
        }
    }

    static async get(msg: string, correlationId: string, replyTo: string) {
        const { data: parsed } = JSON.parse(msg).message;
        const parsedData: ParsedData = { action: parsed.action, data: parsed.data };
        const prefix = parsedData.action.split('-')[0];
        
        try {
            if (prefix === prefixes.task) {
                if (parsedData.action === actions.taskCreate) {
                    const data = await taskOperations[parsedData.action](parsedData.data, correlationId);
                    data && await Notification.send({ action: parsedData.action, data }, correlationId, replyTo)
                } else if ([actions.taskSend, actions.taskGet].includes(parsedData.action)) {
                    await taskOperations[actions.taskGet](parsedData.data, parsedData.data.state);
                } else {
                    const data = { message: 'Unknown action' }
                    await Notification.send({ action: parsedData.action, data }, correlationId, replyTo)
                }
            }

            if (Notification.promiseMap.has(correlationId)) {
                const resolve = Notification.promiseMap.get(correlationId);

                if (resolve) {
                    resolve(parsedData);
                }

                Notification.promiseMap.delete(correlationId);
            }

        } catch (error: any) {
            console.error(`Error While Parsing the message: ${error.message}`,);
            await Notification.send({ action: parsedData.action, data: new ErrorMsgResponse(error.message) }, correlationId, replyTo)
        }
    }
}
