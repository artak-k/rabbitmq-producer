import { generateUuid } from "../utils/utils";
import { config } from "dotenv";

config();

const rmqUser = String(process.env.RABBITMQ_USERNAME);
const rmqPass = String(process.env.RABBITMQ_PASSWORD);
const rmqHost = String(process.env.RABBITMQ_URL);
const rmqUri = `amqp://${rmqUser}:${rmqPass}@${rmqHost}:5672`;

const NOTIFICATION_QUEUE = {
    task: '@task',
    queue: '@queue',
    queueReply: '@' + generateUuid()
};

export default {
    rmqUri,
    NOTIFICATION_QUEUE
}