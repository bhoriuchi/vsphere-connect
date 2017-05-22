export default {
  description: 'Return all objects of a specific type',
  usage: ['v.type(name) → type'],
  example: {
    description: 'Select all Virtual Machines',
    code: 'v.type(\'vm\')'
  },
  content: [
    {
      type: 'html',
      html: '<h4>Type resolution</h4>All type names are run through a resolution method in order to determine ' +
      'their formal object name. This allows lowercase names to be provided, but it also allows types with long ' +
      'non-user friendly names like <code>ClusterComputeResource</code> to be aliased to <code>cluster</code>' +
      '<br><br><table class="table table-bordered table-striped">' +
      '<thead>' +
      '<tr>' +
      '<td><b>Formal Type</b></td>' +
      '<td><b>Alias</b></td>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr>' +
      '<td>ClusterComputeResource</td>' +
      '<td>cluster</td>' +
      '</tr>' +
      '<tr>' +
      '<td>DistributedVirtualSwitch</td>' +
      '<td>dvswitch</td>' +
      '</tr>' +
      '<tr>' +
      '<td>HostSystem</td>' +
      '<td>host</td>' +
      '</tr>' +
      '<tr>' +
      '<td>Datastore</td>' +
      '<td>store</td>' +
      '</tr>' +
      '<tr>' +
      '<td>StoragePod</td>' +
      '<td>storecluster</td>' +
      '</tr>' +
      '<tr>' +
      '<td>VirtualMachine</td>' +
      '<td>vm</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    }
  ]
}
