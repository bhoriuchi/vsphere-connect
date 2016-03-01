

# vsphere-connect
---

A [`bluebird`](https://github.com/petkaantonov/bluebird) Promise based vSphere client. Allows you to search managed objects and execute methods. More functionality will be provided in future releases.

[`WIKI`](https://github.com/bhoriuchi/vsphere-connect/wiki)
[`Change Log`](https://github.com/bhoriuchi/vsphere-connect/wiki/Change-Log)

---

#### Basic Example
```js
var connect = require('vsphere-connect');

// create a client and automatically log in
connect.createClient({
    host: 'vcenter.mydomain.com',
    username: 'administrator@vsphere.local',
    password: 'vmware1',
    ignoreSSL: true,
    autoLogin: true
})
.then(function(client) {

    // retrieve 2 virtual machines by id
    return client.retrieve({
        type: 'VirtualMachine',
        id: ['vm-1234', 'vm-5678'],
        properties: ['name', 'config.version']
    })
    .then(function(results) {
        // process results
    });
})
.caught(function(err) {
    // handle error
});
```

---

### API

##### connect.createClient(`args`)
Creates a new vSphere client

**`Parameters`**
* **`args`** `{Object}` - Arguments hash
  * **`host`** `{string}` - viServer DNS name or IP
  * **[`username`]** `{string}` - User name to log in with. Optional if using a session id to login
  * **[`password`]** `{string}` - Password. Required if using username to log in
  * **[`sessionId`]** `{string}` - Session Id to authenticate with
  * **[`ignoreSSL=false`]** `{boolean}` - Ignore invalid SSL certificates during login
  * **[`autoLogin=false`]** `{boolean}` - If true, automatically log in after client creation
  * **[`exclusive=false`]** `{boolean}` - If true, terminate all other sessions from the same user and IP keeping the current. Useful for service crash and restart
  * **[`maxRetry=1`]** `{number}` - Number of times to try reconnecting after receiving a `NotAuthenticatedFault`
  * **[`events`]** `{Object | boolean}` - Query the viServer for events and emit those events as javascript events from the client
    * **[`interval=60000`]** `{number}` - Time in milliseconds between Event queries

**`Returns`** `{Promise}` - Returns a Promise that resolves to a viClient instance

---

##### connect.format(`result`)
Formats the SOAP response from `client.method()` into a `JSON` object

**`Parameters`**
* **`result`** `{Object}` - Result of a call to `client.method()`

**`Returns`** `{Object}` - Returns a formatted `JSON` object

---

##### client.logIn(`args`)
Log into vSphere. Not necessary if `autoLogin=true` was passed to `createClient()`

**`Parameters`**
* **`args`** `{Object}` - Arguments hash
  * **[`username`]** `{string}` - User name to log in with. Optional if using a session id to login
  * **[`password`]** `{string}` - Password. Required if using username to log in
  * **[`sessionId`]** `{string}` - Session Id to authenticate with
  * **[`exclusive=false`]** `{boolean}` - If true, terminate all other sessions from the same user and IP keeping the current. Useful for service crash and restart
  * **[`maxRetry=1`]** `{number}` - Number of times to try reconnecting after receiving a `NotAuthenticatedFault`

**`Returns`** `{Promise}` - Returns a Promise that resolves to a session object

**`Events`**
  * **`login`** `{Object | string}` - The session or session id

---

##### client.logOut()
Log out of vSphere

**`Returns`** `{Promise}` - Returns a Promise

**`Events`**
  * **`logout`** `{string[]}` - Array of session IDs logged out or terminated

---

##### client.method(`name`, `args`)
Executes a vSphere method

**`Parameters`**
* **`name`** `{string}` - Method name
* **`args`** `{Object}` - Arguments for the method

**`Returns`** `{Promise}` - Returns a Promise that resolves to the method output

**`Events`**
  * **`method.error`** `{SoapError}` - SOAP Error
  * **`method.result`** `{SoapResult}` - SOAP Result

---

##### client.retrieve(`args`, [`options`])
Retrieves a set of objects with the specified properties by type or id

**`Parameters`**
* **`args`** `{Object | Object[]}` - Arguments hash or array of arguments hash. If an array, multiple types can be specified for retrieval each with their own unique property set
  * **`type`** `{string}` - Managed Object type
  * **[`id`]** `{string | string[]}` - Id or array of Ids to retrieve
  * **[`container=rootFolder`]** `{ManagedObjectReference}` - Container to start search from
  * **[`recursive=true`]** `{boolean}` - Recursive search
  * **[`properties`]** `{string | string[]}` - if "all" all properties retrieved. Otherwise array of dot notation properties
* **[`options`]** `{Object}` - Options hash
  * **[`maxObjects`]** `{number}` - Maximum objects retrieved

**`Returns`** `{Promise}` - Returns a Promise that resolves to the formatted results of the retrieval

**`Events`**
* **`result`** `{Object}` - Result output of the method
* **`error`** `{Object}` - Error thrown by method

---

##### client.destroy(`args`)
Destroy a Managed Object

**`Parameters`**
* **`args`** `{Object}` - Arguments hash
  * **`type`** `{string}` - Managed Object type
  * **`id`** `{string}` - Id of object to destroy
  * **[`async=true`]** `{boolean}` - If `false`, the task generated will be monitored to completion and returned
  * **[`delay=1000`]** `{number}` - Delay in milliseconds between monitor queries for `async=false`
  * **[`timeout=0`]** `{number}` - Time in milliseconds before the monitor operation should timeout, 0 for never

**`Returns`** `{Promise}` - Returns a Promise that resolves to the ManagedObjectReference of the destroy task

---

##### client.rename(`args`)
Rename a Managed Object

**`Parameters`**
* **`args`** `{Object}` - Arguments hash
  * **`type`** `{string}` - Managed Object type
  * **`id`** `{string}` - Id of object to rename
  * **`name`** `{string}` - New Name
  * **[`async=true`]** `{boolean}` - If `false`, the task generated will be monitored to completion and returned
  * **[`delay=1000`]** `{number}` - Delay in milliseconds between monitor queries for `async=false`
  * **[`timeout=0`]** `{number}` - Time in milliseconds before the monitor operation should timeout, 0 for never

**`Returns`** `{Promise}` - Returns a Promise that resolves to the ManagedObjectReference of the rename task

---

##### client.findParentType(`args`)
Finds the next parent of a specific type from a starting object (i.e. find the cluster a VM is located in even if there are resource pools in between). Optionally if parent types are nested (like resource pools) a root option can be passed to get the root parent type. 

**`Parameters`**
* **`args`** `{Object}` - Arguments hash
  * **`type`** `{string}` - Managed Object type
  * **`id`** `{string}` - Id of object to rename
  * **`parentType`** `{string}` - Parent type name
  * **[`root=false`]** `{boolean}` - Whether or not to ascend up the parent tree until the root parent is found

**`Returns`** `{Promise}` - Returns a Promise that resolves to the parent's ManagedObjectReference

---

##### client.emitUpdates(`args`, [`options`])
Monitors a list of properties on one or more object types for changes and emits the changes as an event. Updates are checked on an interval that must be greater than or equal to one minute.

**`Parameters`**
* **`args`** `{Object | Object[]}` - Arguments hash or array of arguments hash. If an array, multiple types can be specified for retrieval each with their own unique property set
  * **`type`** `{string}` - Managed Object type
  * **[`id`]** `{string | string[]}` - Id or array of Ids to retrieve
  * **[`container=rootFolder`]** `{ManagedObjectReference}` - Container to start search from
  * **[`recursive=true`]** `{boolean}` - Recursive search
  * **[`properties`]** `{string | string[]}` - if "all" all properties retrieved. Otherwise array of dot notation properties
* **[`options`]** `{Object}` - Options hash
  * **[`interval`]** `{number}` - Time in milliseconds between update checks

**`Events`**
* **`updates`** `{Object[]}` - The objects and their updates. No event will be emitted if there are no updates

---



##### client.time()
Returns the server time

**`Returns`** `{Promise}` - Returns a Promise that resolves to the server time

---


##### client.monitor.task(`id`, [`delay`], [`timeout`])
Monitors a task until it completes or times out

**`Parameters`**
* **`id`** `{String}` - Task id to monitor
* **[`delay=1000`]** `{number}` - Delay in milliseconds between status polls
* **[`timeout=0`]** `{number}` - Time in milliseconds before the monitor times out. 0 for no timeout

**`Returns`** `{Promise}` - Returns a Promise that resolves to task info after the task has been completed

**`Events`**
* **`task.state`** `{Object}` - Emits the task id and state on each poll cycle


##### util.moRef(`type`, `id`)
Creates a ManagedObjectReference

* **`type`** `{string}` - Managed Object type
* **`id`** `{string}` - Id of object

**`Returns`** `{ManagedObjectReference}` - Returns a ManagedObjectReference that can be used with `client.method()`

---

### Event Monitor

`vsphere-connect` has the option to periodically query the viServer for recent events. These events are then emitted from the client. This means that events are not real time but may still be useful. A user defined interval for polling can be set when creating the client to allow for more frequent event queries. The event monitor also emits an `emitlog` event after every interval so it can also be used to track the status of the event monitor.

---

#### Generic Method Example

```js
var connect = require('vsphere-connect');
var util    = connect.util;

// create a client and automatically log in
connect.createClient({
    host: 'vcenter.mydomain.com',
    username: 'administrator@vsphere.local',
    password: 'vmware1',
    ignoreSSL: true,
    autoLogin: true
})
.then(function(client) {
    
    // create a destroy task to remove a vm
    return client.method('Destroy_Task', {
        _this: util.moRef('VirtualMachine', 'vm-123')
    })
    .then(function(result) {
        // process the results
    });
});

```

---

#### Event Example

```js
var connect = require('vsphere-connect');
var util    = connect.util;

// create a client and automatically log in
connect.createClient({
    host: 'vcenter.mydomain.com',
    username: 'administrator@vsphere.local',
    password: 'vmware1',
    ignoreSSL: true,
    autoLogin: true,
    events: {
        interval: 10000 // every 10 seconds
    }
})
.then(function(client) {
    
    // add event listener
    client.on('TaskEvent', function(task) {
        // process task
    });
});
```