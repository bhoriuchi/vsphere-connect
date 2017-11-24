import _ from 'lodash'

const types = {}

const containerView = {
  type: 'ContainerView',
  path: 'view'
}

const ExtensibleManagedObject = {
  availableField: 'vim25:ArrayOfCustomFieldDef',
  value: 'vim25:ArrayOfCustomFieldValue'
}

let ManagedEntity = _.merge({}, ExtensibleManagedObject, {
  configIssue: 'vim25:ArrayOfEvent',
  configStatus: 'vim25:ManagedEntityStatus',
  customValue: 'vim25:ArrayOfCustomFieldValue',
  declaredAlarmState: 'vim25:ArrayOfAlarmState',
  disabledMethod: 'xsd:ArrayOfstring',
  effectiveRole: 'xsd:ArrayOfint',
  name: 'xsd:string',
  overallStatus: 'vim25:ManagedEntityStatus',
  parent: 'vim25:ManagedObjectReference',
  permission: 'vim25:ArrayOfPermission',
  recentTask: 'vim25:ArrayOfManagedObjectReference',
  triggeredAlarmState: 'vim25:ArrayOfAlarmState'
})

const ComputeResource = _.merge({}, ManagedEntity, {
  configurationEx: 'vim25:ComputeResourceConfigInfo',
  datastore: 'vim25:ArrayOfManagedObjectReference',
  environmentBrowser: 'vim25:ManagedObjectReference',
  host: 'vim25:ArrayOfManagedObjectReference',
  network: 'vim25:ArrayOfManagedObjectReference',
  resourcePool: 'vim25:ManagedObjectReference',
  summary: 'vim25:ComputeResourceSummary'
})

types['2.5'] = {
  Alarm: {},
  AlarmManager: {},
  AuthorizationManager: {},
  ClusterComputeResource: {
    listSpec: containerView,
    properties: _.merge({}, ComputeResource, {
      actionHistory: 'vim25:ArrayOfClusterActionHistory',
      drsFault: 'vim25:ArrayOfClusterDrsFaults',
      migrationHistory: 'vim25:ArrayOfClusterDrsMigration',
      recommendation: 'vim25:ArrayOfClusterRecommendation'
    })
  },
  ComputeResource: {
    listSpec: containerView,
    properties: ComputeResource
  },
  ContainerView: {},
  CustomFieldsManager: {},
  CustomizationSpecManager: {},
  Datacenter: {
    listSpec: containerView,
    properties: _.merge({}, ManagedEntity, {
      datastore: 'vim25:ArrayOfManagedObjectReference',
      hostFolder: 'vim25:ManagedObjectReference',
      network: 'vim25:ArrayOfManagedObjectReference',
      vmFolder: 'vim25:ManagedObjectReference'
    })
  },
  Datastore: {
    listSpec: containerView,
    properties: _.merge({}, ManagedEntity, {
      browser: 'vim25:ManagedObjectReference',
      capability: 'vim25:DatastoreCapability',
      host: 'vim25:ArrayOfDatastoreHostMount',
      info: 'vim25:DatastoreInfo',
      summary: 'vim25:DatastoreSummary',
      vm: 'vim25:ArrayOfManagedObjectReference'
    })
  },
  DiagnosticManager: {},
  EnvironmentBrowser: {},
  EventHistoryCollector: {},
  EventManager: {},
  ExtensibleManagedObject: {},
  ExtensionManager: {},
  FileManager: {},
  Folder: {
    listSpec: containerView,
    properties: _.merge({}, ManagedEntity, {
      childEntity: 'vim25:ArrayOfManagedObjectReference',
      childType: 'xsd:ArrayOfstring'
    })
  },
  HistoryCollector: {},
  HostAutoStartManager: {},
  HostBootDeviceSystem: {},
  HostCpuSchedulerSystem: {},
  HostDatastoreBrowser: {},
  HostDatastoreSystem: {},
  HostDateTimeSystem: {},
  HostDiagnosticSystem: {},
  HostFirewallSystem: {},
  HostFirmwareSystem: {},
  HostHealthStatusSystem: {},
  HostLocalAccountManager: {},
  HostMemorySystem: {},
  HostNetworkSystem: {},
  HostPatchManager: {},
  HostServiceSystem: {},
  HostSnmpSystem: {},
  HostStorageSystem: {},
  HostSystem: {
    listSpec: containerView,
    properties: _.merge({}, ManagedEntity, {
      capability: 'vim25:HostCapability',
      config: 'vim25:HostConfigInfo',
      configManager: 'vim25:HostConfigManager',
      datastore: 'vim25:ArrayOfManagedObjectReference',
      datastoreBrowser: 'vim25:ManagedObjectReference',
      hardware: 'vim25:HostHardwareInfo',
      network: 'vim25:ArrayOfManagedObjectReference',
      runtime: 'vim25:HostRuntimeInfo',
      summary: 'vim25:HostListSummary',
      systemResource: 'vim25:HostSystemResoureInfo',
      vm: 'vim25:ArrayOfManagedObjectReference'
    })
  },
  HostVMotionSystem: {},
  InventoryView: {},
  LicenseManager: {},
  ListView: {},
  ManagedEntity: {
    listSpec: containerView,
    properties: ManagedEntity
  },
  ManagedObjectView: {},
  Network: {
    listSpec: containerView,
    properties: _.merge({}, ManagedEntity, {
      host: 'vim25:ArrayOfManagedObjectReference',
      name: 'xsd:string',
      summary: 'vim25:NetworkSummary',
      vm: 'vim25:ArrayOfManagedObjectReference'
    })
  },
  OptionManager: {},
  PerformanceManager: {},
  PropertyCollector: {},
  PropertyFilter: {},
  ResourcePool: {
    listSpec: containerView,
    properties: {
      childConfiguration: 'vim25:ArrayOfResourceConfigSpec',
      config: 'vim25:ResourceConfigSpec',
      owner: 'vim25:ManagedObjectReference',
      resourcePool: 'vim25:ArrayOfManagedObjectReference',
      runtime: 'vim25:ResourcePoolRuntimeInfo',
      summary: 'vim25:ResourcePoolSummary',
      vm: 'vim25:ArrayOfManagedObjectReference'
    }
  },
  ScheduledTask: {
    listSpec: {
      type: 'ScheduledTaskManager',
      id: 'ScheduledTaskManager',
      path: 'scheduledTask'
    }
  },
  ScheduledTaskManager: {},
  SearchIndex: {},
  ServiceInstance: {},
  SessionManager: {},
  Task: {
    listSpec: {
      type: 'TaskManager',
      id: 'TaskManager',
      path: 'recentTask'
    }
  },
  TaskHistoryCollector: {},
  TaskManager: {},
  UserDirectory: {},
  View: {},
  ViewManager: {},
  VirtualDiskManager: {},
  VirtualMachine: {
    listSpec: containerView,
    properties: {
      capability: 'vim25:VirtualMachineCapability',
      config: 'vim25:VirtualMachineConfigInfo',
      datastore: 'vim25:ArrayOfManagedObjectReference',
      environmentBrowser: 'vim25:ManagedObjectReference',
      guest: 'vim25:GuestInfo',
      guestHeartbeatStatus: 'vim25:ManagedEntityStatus',
      layout: 'vim25:VirtualMachineFileLayout',
      network: 'vim25:ArrayOfManagedObjectReference',
      resourceConfig: 'vim25:ResourceConfigSpec',
      runtime: 'vim25:VirtualMachineRuntimeInfo',
      snapshot: 'vim25:VirtualMachineSnapshotInfo',
      summary: 'vim25:VirtualMachineSummary'
    }
  },
  VirtualMachineSnapshot: {}
}

// Required update to all ManagedEntities
ManagedEntity = _.merge({}, ManagedEntity, {
  alarmActionsEnabled: 'xsd:boolean',
  tag: 'vim25:ArrayOfTag'
})

const DistributedVirtualSwitch = _.merge({}, ManagedEntity, {
  capability: 'vim25:DVSCapability',
  config: 'vim25:DVSConfigInfo',
  networkResourcePool: 'vim25:ArrayOfDVSNetworkResourcePool',
  portgroup: 'vim25:ArrayOfManagedObjectReference',
  summary: 'vim25:DVSummary',
  uuid: 'xsd:string'
})

types['4.0'] = _.omit(_.merge({}, types['2.5'], {
  ClusterProfile: {},
  ClusterProfileManager: {},
  ClusterComputeResource: {
    properties: ManagedEntity
  },
  ComputeResource: {
    properties: ManagedEntity
  },
  Datacenter: {
    properties: _.merge({}, ManagedEntity, {
      datastoreFolder: 'vim25:ManagedObjectReference',
      networkFolder: 'vim25:ManagedObjectReference'
    })
  },
  Datastore: {
    properties: ManagedEntity
  },
  DistributedVirtualPortgroup: {
    listSpec: containerView,
    properties: _.merge({}, ManagedEntity, types['2.5'].Network.properties, {
      config: 'vim25:DVPortgroupConfigInfo',
      key: 'xsd:string',
      portKeys: 'xsd:ArrayOfString'
    })
  },
  DistributedVirtualSwitch: {
    listSpec: containerView,
    properties: DistributedVirtualSwitch
  },
  DistributedVirtualSwitchManager: {},
  Folder: {
    properties: ManagedEntity
  },
  HostKernelModuleSystem: {},
  HostPciPassthruSystem: {},
  HostProfile: {},
  HostProfileManager: {},
  HostSystem: {
    properties: ManagedEntity
  },
  HostVirtualNicManager: {},
  HttpNfcLease: {},
  IpPoolManager: {},
  LicenseAssignmentManager: {},
  LocalizationManager: {},
  Network: {
    properties: ManagedEntity
  },
  OvfManager: {},
  Profile: {},
  ProfileComplianceManager: {},
  ProfileManager: {},
  ResourcePlanningManager: {},
  ResourcePool: {
    properties: ManagedEntity
  },
  VirtualApp: {
    listSpec: containerView,
    properties: _.merge({}, types['2.5'].ResourcePool.properties, {
      datastore: 'vim25:ArrayOfManagedObjectReference',
      network: 'vim25:ArrayOfManagedObjectReference',
      vAppConfig: 'vim25:VAppConfigInfo'
    })
  },
  VirtualizationManager: {},
  VirtualMachine: {
    properties: _.merge({}, ManagedEntity, {
      layoutEx: 'vim25:VirtualMachineFileLayoutEx',
      storage: 'vim25:VirtualMachineStorageInfo'
    })
  },
  VirtualMachineCompatibilityChecker: {},
  VirtualMachineProvisioningChecker: {},
  VmwareDistributedVirtualSwitch: {
    listSpec: containerView,
    properties: _.merge({}, DistributedVirtualSwitch)
  }
}), [
  'VirtualMachine.properties.layout'
])

types['4.1'] = _.omit(_.merge({}, types['4.0'], {
  Datastore: {
    properties: {
      iormConfiguration: 'vim25:StorageIORMInfo'
    }
  },
  HostActiveDirectoryAuthentication: {},
  HostAuthenticationManager: {},
  HostAuthenticationStore: {},
  HostDirectoryStore: {},
  HostLocalAuthentication: {},
  HostPowerSystem: {},
  StorageResourceManager: {},
  VirtualApp: {
    properties: {
      childLink: 'vim25:ArrayOfVirtualAppLinkInfo',
      parentVApp: 'vim25:ManagedObjectReference'
    }
  },
  VirtualMachine: {
    properties: {
      parentVApp: 'vim25:ManagedObjectReference',
      rootSnapshot: 'vim25:ArrayOfManagedObjectReference'
    }
  }
}), [
  'DistributedVirtualSwitch.properties.networkResourcePool',
  'VmwareDistributedVirtualSwitch.properties.networkResourcePool'
])

types['5.0'] = _.merge({}, types['4.1'], {
  GuestAuthManager: {},
  GuestFileManager: {},
  GuestOperationsManager: {},
  GuestProcessManager: {},
  HostCacheConfigurationManager: {},
  HostEsxAgentHostManager: {},
  HostImageConfigManager: {},
  HostSystem: {
    properties: {
      licensableResource: 'vim25:HostLicensableResourceInfo'
    }
  },
  IscsiManager: {},
  StoragePod: {
    listSpec: containerView,
    properties: _.merge({}, types['4.1'].Folder.properties, {
      podStorageDrsEntry: 'vim25:PodStorageDrsEntry',
      summary: 'vim25:StoragePodSummary'
    })
  }
})

types['5.1'] = _.omit(_.merge({}, types['5.0'], {
  Datacenter: {
    properties: {
      configuration: 'vim25:DatacenterConfigInfo'
    }
  },
  DistributedVirtualSwitch: {
    properties: {
      runtime: 'vim25:DVSRuntimeInfo'
    }
  },
  VmwareDistributedVirtualSwitch: {
    properties: {
      runtime: 'vim25:DVSRuntimeInfo'
    }
  },
  SessionManager: {},
  SimpleCommand: {}
}), [
  'VirtualApp.properties.childLink'
])

types['5.5'] = _.merge({}, types['5.1'], {
  DatastoreNamespaceManager: {},
  HostGraphicsManager: {},
  HostVFlashManager: {},
  HostVsanInternalSystem: {},
  HostVsanSystem: {},
  OpaqueNetwork: {
    listSpec: containerView,
    properties: _.merge({}, types['5.1'].Network.properties)
  }
})

types['6.0'] = _.merge({}, types['5.5'], {
  CertificateManager: {},
  ClusterEVCManager: {},
  GuestAliasManager: {},
  GuestWindowsRegistryManager: {},
  HostAccessManager: {},
  HostCertificateManager: {},
  IoFilterManager: {},
  MessageBusProxy: {},
  OverheadMemoryManager: {},
  VRPResourceManager: {},
  VsanUpgradeSystem: {}
})

types['6.5'] = _.merge({}, types['6.0'], {
  CryptoManager: {},
  CryptoManagerKmip: {},
  FailoverClusterConfigurator: {},
  FailoverClusterManager: {},
  HealthUpdateManager: {},
  HostSpecificationManager: {},
  HostVStorageObjectManager: {},
  OpaqueNetwork: {
    properties: _.merge({}, types['6.0'].OpaqueNetwork.properties, {
      capability: 'vim25:OpaqueNetworkCapability',
      extraConfig: 'vim25:ArrayOfOptionValue'
    })
  },
  VcenterVStorageObjectManager: {},
  VStorageObjectManagerBase: {}
})

export default types
