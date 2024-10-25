import { actions, ITask, TaskState } from "../../config/constants";
import TaskService from "./task.service";

export default {
  [actions.taskSend]: () => TaskService.send(),
  [actions.taskCreate]: (data: ITask, taskId: string) => TaskService.reply2(data, taskId),
  [actions.taskGet]: (data: ITask, state: TaskState) => TaskService.updateQueueData2(data, state)
}