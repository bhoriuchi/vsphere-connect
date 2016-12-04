import _ from 'lodash'
import { errorHandler, resultHandler } from '../utils/index'

const ONE_MINUTE_IN_MS = 60000
const ONE_SECOND_IN_MS = 1000
const FIRST_INTERVAL = 500
const ERROR = 'error'
const SUCCESS = 'success'
const QUEUED = 'queued'
const RUNNING = 'running'

export class TaskMonitor {
  constructor (client, taskId, options = {}, callback = () => null) {
    return new Promise((resolve, reject) => {
      let { timeout, interval } = options
      this.start = Date.now()
      this.client = client
      this.taskId = taskId
      this.interval = _.isNumber(interval) && interval > ONE_SECOND_IN_MS ? parseInt(interval) : ONE_SECOND_IN_MS
      this.timeout = _.isNumber(timeout) && timeout > this.interval ? parseInt(timeout) : ONE_MINUTE_IN_MS
      this.callback = callback
      this.resolve = resolve
      this.reject = reject
      this.monitor(FIRST_INTERVAL) // short first interval for quick tasks like rename
    })
  }

  monitor (interval) {
    setTimeout(() => {
      return this.client.retrieve({
        type: 'Task',
        id: this.taskId,
        properties: [
          'info.state',
          'info.error',
          'info.result',
          'info.startTime',
          'info.completeTime',
          'info.entity',
          'info.description'
        ]
      }, (err, result) => {
        let task = _.get(result, '[0]')
        if (err) return errorHandler(err, this.callback, this.reject)
        let state = _.get(task, 'info.state')
        if (!state) return errorHandler(new Error(`task ${this.taskId} was not found`), this.callback, this.reject)
        this.client.emit('task.state', { id: this.taskId, state })
        if (state === ERROR) {
          let taskError = new Error({
            task: this.taskId,
            info: task
          })
          return errorHandler(taskError, this.callback, this.reject)
        } else if (state === SUCCESS) {
          return resultHandler(task, this.callback, this.resolve)
        } else if ((Date.now() - this.start) >= this.timeout) {
          let timeoutError = new Error({
            task: this.taskId,
            message: 'the task monitor timed out, the task may still complete successfully',
            info: task
          })
          return errorHandler(timeoutError, this.callback, this.reject)
        } else {
          return this.monitor(this.interval)
        }
      })
    }, interval)
  }
}

export default function (client, taskId, options, callback) {
  return new TaskMonitor(client, taskId, options, callback)
}