# vsphere-connect

A modern vSphere Client

*Currently undergoing a major re-write see `development` branch for current progress*

[Project Page](http://bhoriuchi.github.io/vsphere-connect)

### Summary
vSphere connect is a modern vSphere client that has been re-designed to mimic RethinkDB's ReQL and provide a way to construct powerful and complex requests easily. vsphere-connect also provides pseudo-realtime changefeeds that take advantage of the vSphere `WaitForUpdatesEx` to provided change events through an RxJS Observable

### Example

Return a list of VirtualMachines with 2 CPUs

```js
import VConnect from 'vsphere-connect'
let v = VConnect('vcenter.mydomain.com')
  .login('administrator@vsphere.local', 'vmware100')
  
v.type('vm')
  .pluck({
    config: {
      hardware: {
        numCPU: true
      }
    }
  })
  .filter(vm => {
    return v.expr(vm)('config')('hardware')('numCPU')
      .default(0)
      .eq(2)
  })('name')
  .then(console.log)
```

### Example

Subscribe to changes on 2 VMs

```js
import VConnect from 'vsphere-connect'
let v = VConnect('vcenter.mydomain.com')
  .login('administrator@vsphere.local', 'vmware100')

v.type('vm')
  .allData()
  .get('vm-10', 'vm-54')
  .changes()
  .subscribe(
    change => {
      console.log(change)
    },
    error => {
      console.error(error)
    },
    () => {
      console.log('complete')
    }
  )
```
