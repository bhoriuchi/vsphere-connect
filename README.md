

# vsphere-connect
---

A Promise based vSphere client. Allows you to search managed objects and execute methods.


### Examples

##### Search

```js
// require module
var connect = require('../lib');

// create a new client instance
var viclient = new connect.Client();

// connect to vsphere
viclient('myhost.mydomain.com', 'vSphereUsername', 'password', true)
.then(function(client) {

    // search for a specific VM
    return client.searchManagedObjects({
		type: 'VirtualMachine',
		id: ['vm-123'],      // omit to return all VMs
		properties: ['name'] // string literal all for all properties
	})
	.then(function(result) {
	    // print the results
		console.log(JSON.stringify(result, null, '  '));
		
		// log out
		return client.logOut();
	})
	.caught(function(err) {
        // handle error
	});
});

```

##### Generic Method Usage

```js
// require module
var connect = require('../lib');
var util    = connect.util;

// create a new client instance
var viclient = new connect.Client();

// connect to vsphere
viclient('myhost.mydomain.com', 'vSphereUsername', 'password', true)
.then(function(client) {
    
    // create a destroy task to remove a vm
    return client.method('Destroy_Task', {
        _this: util.moRef('VirtualMachine', 'vm-123')
    })
    .then(function(result) {
        return {
            Task: result.$value
        };
    });
});

```



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.


