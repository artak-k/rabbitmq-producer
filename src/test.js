// const tasks = [
//     {
//         "taskType": "regular",
//         "priority": 2,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "First",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 2,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "Second",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 2,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "third",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 2,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "fourth",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 5,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "full-sync",
//         "priority": 6,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 7,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 7,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 7,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 8,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 71,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     },
//     {
//         "taskType": "regular",
//         "priority": 17,
//         "content": {
//             "task": {
//                 "user": {
//                     "name": "John",
//                     "age": 20
//                 }
//             }
//         }
//     }
// ];
// class MaxHeapPriorityQueue {
//     constructor() {
//         this.data = []
//         this.size = 0;
//         this.finalData = [];
//     }

//     add(task) {
//         if (task === undefined) return;
//         this.data.push(task);
//         this._bubbleUp(this.data.length - 1);
//     }

//     _bubbleUp(i) {
//         const parentIndex = Math.floor((i - 1) / 2);

//         if (parentIndex >= 0 && this.data[i].priority > this.data[parentIndex].priority) {
//             this._swap(i, parentIndex);
//             this._bubbleUp(parentIndex);
//         }
//     }

//     _swap(i, j) {
//         [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
//     }

//     remove() {
//         if (this.isEmpty()) return;

//         if (this.data.length === 1) {
//             return this.data.pop();
//         }

//         const highest = this.data[0];
//         this.data[0] = this.data.pop();
//         this._bubbleDown();
//         return highest;
//     }

//     _bubbleDown(i = 0) {
//         const leftChildIndex = 2 * i + 1;
//         const rightChildIndex = 2 * i + 2;
//         let largestIndex = i;

//         if (leftChildIndex < this.data.length && this.data[leftChildIndex].priority > this.data[largestIndex].priority) {
//             largestIndex = leftChildIndex;
//         }

//         if (rightChildIndex < this.data.length && this.data[rightChildIndex].priority > this.data[largestIndex].priority) {
//             largestIndex = rightChildIndex;
//         }

//         if (largestIndex !== i) {
//             this._swap(i, largestIndex);
//             this._bubbleDown(largestIndex);
//         }
//     }

//     isEmpty() {
//         return this.data.length === 0;
//     }

//     hasPendingFullSync() {
//         return this.data.some((task) => task.taskType === taskTypes.fullSync && task.state === taskStates.pending);
//     }
// }

// const heap = new MaxHeapPriorityQueue()
// for (let task of tasks) {
//     heap.add(task)
// }

// console.log(heap.data)
// heap.remove()
// console.log(heap.data)