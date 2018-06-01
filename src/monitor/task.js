import _ from 'lodash';
import Promise from 'bluebird';

const ONE_MINUTE_IN_MS = 60000;
const ONE_SECOND_IN_MS = 1000;
const FIRST_INTERVAL = 500;
const ERROR = 'error';
const SUCCESS = 'success';
// const QUEUED = 'queued'
// const RUNNING = 'running'

export class TaskMonitor {
  constructor(client, taskId, options) {
    const { timeout, interval } = _.isObject(options) ? options : {};

    return new Promise((resolve, reject) => {
      this.start = Date.now();
      this.client = client;
      this.taskId = taskId;
      this.interval =
        _.isNumber(interval) && interval > ONE_SECOND_IN_MS
          ? Math.floor(interval)
          : ONE_SECOND_IN_MS;
      this.timeout =
        _.isNumber(timeout) && timeout > this.interval
          ? Math.floor(timeout)
          : ONE_MINUTE_IN_MS;
      this.resolve = resolve;
      this.reject = reject;

      // short first interval for quick tasks like rename
      this.monitor(FIRST_INTERVAL);
    });
  }

  monitor(interval) {
    setTimeout(() => {
      this.client
        .retrieve({
          type: 'Task',
          id: this.taskId,
          properties: [
            'info.state',
            'info.error',
            'info.result',
            'info.startTime',
            'info.completeTime',
            'info.entity',
            'info.description',
          ],
        })
        .then(result => {
          const task = _.get(result, '[0]');
          const state = _.get(task, 'info.state');

          if (!state) {
            return this.reject(new Error(`task ${this.taskId} was not found`));
          }
          this.client.emit('task.state', { id: this.taskId, state });

          switch (state) {
            case ERROR:
              return this.reject(new Error({ task: this.taskId, info: task }));
            case SUCCESS:
              return this.resolve(task);
            default:
              return Date.now() - this.start >= this.timeout
                ? this.reject(
                    new Error(
                      'the task monitor timed out, ' +
                        'the task may still complete successfully',
                    ),
                  )
                : this.monitor(this.interval);
          }
        }, this.reject);
    }, interval);
  }
}

export default function(client, taskId, options) {
  return new TaskMonitor(client, taskId, options);
}
