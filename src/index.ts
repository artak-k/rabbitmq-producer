import config from "./config/config";
import mqConnection from "./config/rabbitmq.config";
import redisPriorityQueue from "./config/redisPriorityQueue";
import { Notification } from "./utils/notification";

(async () => {
    await redisPriorityQueue.init();
    await startConsumers()
})();

async function startConsumers() {
    try {
        await mqConnection.consume(config.NOTIFICATION_QUEUE.task, Notification.get);

        await mqConnection.consume(config.NOTIFICATION_QUEUE.queueReply, Notification.get);
    } catch (error: any) {
        console.error(`Error occurred while starting consumers: ${error.message}`, error);
    }
}