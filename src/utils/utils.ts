import crypto from 'crypto'


export const generateHash = (data: any) => {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

export const generateUuid = () => {
  return Math.ceil((Math.random() * Number.MAX_SAFE_INTEGER)).toString() + Number.MAX_SAFE_INTEGER + Date.now();
}

export const logTask = (taskId: string, state: string, taskType: string, priority: number) => {
  console.log(`\nId: ${taskId}\nPriority: ${priority}\nState: ${state}\nType: ${taskType}\n`)
}