'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var EventEmitter = _interopDefault(require('events'));
var soap = _interopDefault(require('soap-connect'));
var Promise$1 = _interopDefault(require('bluebird'));
var Rx = _interopDefault(require('rxjs'));
var Debug = _interopDefault(require('debug'));

/*
 * cacheKey function to allow re-use of cache on same api version and type
 */
var REQUEST_TIMEOUT = 2000;

var SI_XML = '<?xml version="1.0"?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body xmlns:vim25="urn:vim25">\n    <vim25:RetrieveServiceContent>\n      <vim25:_this type="ServiceInstance">ServiceInstance</vim25:_this>\n    </vim25:RetrieveServiceContent>\n  </soapenv:Body>\n</soapenv:Envelope>';

function cacheKey(tools, wsdl, done) {
  var request = tools.request,
      xmldom = tools.xmldom;

  var url = wsdl.replace(/.wsdl.*$/, '');
  var headers = { 'Content-Type': 'text/xml', 'Content-Length': SI_XML.length };

  request.post({ headers: headers, url: url, body: SI_XML, timeout: REQUEST_TIMEOUT }, function (err, res, body) {
    try {
      if (err) return done(err);
      var doc = new xmldom.DOMParser().parseFromString(body);
      var apiType = _.get(doc.getElementsByTagName('apiType'), '[0].textContent');
      var apiVersion = _.get(doc.getElementsByTagName('apiVersion'), '[0].textContent');
      if (apiType && apiVersion) return done(null, 'VMware-' + apiType + '-' + apiVersion);
      return done(null, null);
    } catch (err) {
      return done(null, null);
    }
  });
}

var types = {};

var containerView = {
  type: 'ContainerView',
  path: 'view'
};

var ExtensibleManagedObject = {
  availableField: 'vim25:ArrayOfCustomFieldDef',
  value: 'vim25:ArrayOfCustomFieldValue'
};

var ManagedEntity = _.merge({}, ExtensibleManagedObject, {
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
});

var ComputeResource = _.merge({}, ManagedEntity, {
  configurationEx: 'vim25:ComputeResourceConfigInfo',
  datastore: 'vim25:ArrayOfManagedObjectReference',
  environmentBrowser: 'vim25:ManagedObjectReference',
  host: 'vim25:ArrayOfManagedObjectReference',
  network: 'vim25:ArrayOfManagedObjectReference',
  resourcePool: 'vim25:ManagedObjectReference',
  summary: 'vim25:ComputeResourceSummary'
});

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
};

// Required update to all ManagedEntities
ManagedEntity = _.merge({}, ManagedEntity, {
  alarmActionsEnabled: 'xsd:boolean',
  tag: 'vim25:ArrayOfTag'
});

var DistributedVirtualSwitch = _.merge({}, ManagedEntity, {
  capability: 'vim25:DVSCapability',
  config: 'vim25:DVSConfigInfo',
  networkResourcePool: 'vim25:ArrayOfDVSNetworkResourcePool',
  portgroup: 'vim25:ArrayOfManagedObjectReference',
  summary: 'vim25:DVSummary',
  uuid: 'xsd:string'
});

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
}), ['VirtualMachine.properties.layout']);

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
}), ['DistributedVirtualSwitch.properties.networkResourcePool', 'VmwareDistributedVirtualSwitch.properties.networkResourcePool']);

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
});

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
}), ['VirtualApp.properties.childLink']);

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
});

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
});

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
});

/*
 * Resolves the vim type name without case sensetivity and adds friendly shortcuts
 * like vm for VirtualMachine host for HostSystem, etc.
 */
var ALIAS = {
  cluster: 'ClusterComputeResource',
  dvswitch: 'DistributedVirtualSwitch',
  host: 'HostSystem',
  store: 'Datastore',
  storecluster: 'StoragePod',
  vm: 'VirtualMachine'
};

function typeResolver(apiVersion) {
  var typeMap = _.cloneDeep(ALIAS);
  var types$$1 = _.get(types, apiVersion) || _.get(types, _.last(_.keys(types))); // default to latest apiVersion
  _.forEach(types$$1, function (v, k) {
    typeMap[_.toLower(k)] = k;
  });
  return function (type) {
    return _.get(typeMap, _.toLower(type));
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var ONE_MINUTE_IN_MS = 60000;
var ONE_SECOND_IN_MS = 1000;
var FIRST_INTERVAL = 500;
var ERROR = 'error';
var SUCCESS = 'success';
var TaskMonitor = function () {
  function TaskMonitor(client, taskId, options) {
    var _this = this;

    classCallCheck(this, TaskMonitor);

    var _ref = _.isObject(options) ? options : {},
        timeout = _ref.timeout,
        interval = _ref.interval;

    return new Promise$1(function (resolve, reject) {
      _this.start = Date.now();
      _this.client = client;
      _this.taskId = taskId;
      _this.interval = _.isNumber(interval) && interval > ONE_SECOND_IN_MS ? Math.floor(interval) : ONE_SECOND_IN_MS;
      _this.timeout = _.isNumber(timeout) && timeout > _this.interval ? Math.floor(timeout) : ONE_MINUTE_IN_MS;
      _this.resolve = resolve;
      _this.reject = reject;
      _this.monitor(FIRST_INTERVAL); // short first interval for quick tasks like rename
    });
  }

  createClass(TaskMonitor, [{
    key: 'monitor',
    value: function monitor(interval) {
      var _this2 = this;

      setTimeout(function () {
        _this2.client.retrieve({
          type: 'Task',
          id: _this2.taskId,
          properties: ['info.state', 'info.error', 'info.result', 'info.startTime', 'info.completeTime', 'info.entity', 'info.description']
        }).then(function (result) {
          var task = _.get(result, '[0]');
          var state = _.get(task, 'info.state');

          if (!state) return _this2.reject(new Error('task ' + _this2.taskId + ' was not found'));
          _this2.client.emit('task.state', { id: _this2.taskId, state: state });

          switch (state) {
            case ERROR:
              return _this2.reject(new Error({ task: _this2.taskId, info: task }));
            case SUCCESS:
              return _this2.resolve(task);
            default:
              return Date.now() - _this2.start >= _this2.timeout ? _this2.reject(new Error('the task monitor timed out, the task may still complete successfully')) : _this2.monitor(_this2.interval);
          }
        }, _this2.reject);
      }, interval);
    }
  }]);
  return TaskMonitor;
}();

var task = function (client, taskId, options) {
  return new TaskMonitor(client, taskId, options);
};

var monitor = {
  task: task
};

function moRef(type, value) {
  var t = _.isString(type) ? type : _.get(type, 'type');
  var v = _.isString(type) ? value : _.get(type, 'value', _.get(type, 'id'));

  if (!t || !v) throw new Error('cannot resolve moRef, missing type info');
  return { type: t, value: v };
}

function destroy(moRef$$1, options) {
  var _this = this;

  try {
    return this.method('Destroy_Task', {
      _this: moRef(moRef$$1)
    }).then(function (task$$1) {
      return _.get(options, 'async') === false ? monitor.task(_this, _.get(task$$1, 'value'), options) : task$$1;
    });
  } catch (error) {
    return Promise$1.reject(error);
  }
}

var CookieSecurity = soap.Security.CookieSecurity;

function getToken(headers) {
  return _.get(_.get(headers, 'set-cookie[0]', '').match(/"(.*)"/), '[1]', null);
}

/**
 *
 * @param username {String} - username or token
 * @param password {String} - password (optional if token specified)
 * @return {Promise.<TResult>|*|Promise.<*>}
 */
function login(username, password) {
  var _this = this;

  var isHostAgent = _.get(this, 'serviceContent.about.apiType') === 'HostAgent';
  var token = _.isString(username) && !password ? username : null;

  // token auth
  if (token) {
    if (isHostAgent) {
      return Promise$1.reject(new Error('token authentication is no supported on host, use username/password'));
    }
    this._token = token;
    this.setSecurity(CookieSecurity('vmware_soap_session="' + this._token + '"'));

    return this.retrieve({
      type: 'SessionManager',
      id: 'SessionManager',
      properties: ['currentSession']
    }).then(function (sessions) {
      _this.loggedIn = true;
      _this._session = _.get(sessions, '[0].currentSession');
      return _this._session;
    });
  }

  // basic auth
  else if (username && password) {
      return this.method('Login', {
        _this: this.serviceContent.sessionManager,
        userName: username,
        password: password
      }).then(function (session) {
        _this.loggedIn = true;
        _this._soapClient.setSecurity(CookieSecurity(_this._soapClient.lastResponse.headers));
        _this._token = getToken(_this._soapClient.lastResponse.headers);
        _this._session = session;
        return _this._session;
      }, console.error);
    }

  return Promise$1.reject('no credentials provided');
}

function logout() {
  var _this = this;

  return this.method('Logout', {
    _this: this.serviceContent.sessionManager
  }).then(function () {
    _this.loggedIn = false;
    return { logout: true };
  });
}

var VSphereConnectError = function (_Error) {
  inherits(VSphereConnectError, _Error);

  function VSphereConnectError(name, code, message) {
    classCallCheck(this, VSphereConnectError);

    var _this = possibleConstructorReturn(this, (VSphereConnectError.__proto__ || Object.getPrototypeOf(VSphereConnectError)).call(this, message));

    _this.name = name;
    _this.code = code;
    return _this;
  }

  return VSphereConnectError;
}(Error);

var ERR_INVALID_METHOD = 'ERR_INVALID_METHOD';

var InvalidMethodError = function (_VSphereConnectError) {
  inherits(InvalidMethodError, _VSphereConnectError);

  function InvalidMethodError(method) {
    classCallCheck(this, InvalidMethodError);
    return possibleConstructorReturn(this, (InvalidMethodError.__proto__ || Object.getPrototypeOf(InvalidMethodError)).call(this, 'InvalidMethodError', ERR_INVALID_METHOD, method + ' is not a valid method'));
  }

  return InvalidMethodError;
}(VSphereConnectError);

var ERR_INVALID_TYPE = 'ERR_INVALID_TYPE';

var InvalidTypeError = function (_VSphereConnectError) {
  inherits(InvalidTypeError, _VSphereConnectError);

  function InvalidTypeError(type) {
    classCallCheck(this, InvalidTypeError);
    return possibleConstructorReturn(this, (InvalidTypeError.__proto__ || Object.getPrototypeOf(InvalidTypeError)).call(this, 'InvalidTypeError', ERR_INVALID_TYPE, type + ' cannot be resolved to a valid vim type'));
  }

  return InvalidTypeError;
}(VSphereConnectError);

var ERR_MISSING_PROPS = 'ERR_MISSING_PROPS';

var MissingPropertiesError = function (_VSphereConnectError) {
  inherits(MissingPropertiesError, _VSphereConnectError);

  function MissingPropertiesError(props) {
    classCallCheck(this, MissingPropertiesError);
    return possibleConstructorReturn(this, (MissingPropertiesError.__proto__ || Object.getPrototypeOf(MissingPropertiesError)).call(this, 'MissingPropertiesError', ERR_MISSING_PROPS, 'missing required properties ' + props.join(', ')));
  }

  return MissingPropertiesError;
}(VSphereConnectError);

var ERR_OBJECT_REF = 'ERR_OBJ_REF';

var ObjectReferenceError = function (_VSphereConnectError) {
  inherits(ObjectReferenceError, _VSphereConnectError);

  function ObjectReferenceError() {
    classCallCheck(this, ObjectReferenceError);
    return possibleConstructorReturn(this, (ObjectReferenceError.__proto__ || Object.getPrototypeOf(ObjectReferenceError)).call(this, 'ObjectReferenceError', ERR_OBJECT_REF, 'Object reference cannot be determined. Please supply' + 'either a valid moRef object ({ type, value }) or type and id'));
  }

  return ObjectReferenceError;
}(VSphereConnectError);

function method(name, args) {
  args = _.isObject(args) ? args : {};
  var method = _.get(this._VimPort, '["' + name + '"]');

  return _.isFunction(method) ? method(args).then(function (result) {
    return _.get(result, 'returnval', result);
  }) : Promise$1.reject(new InvalidMethodError(name));
}

function reload(moRef$$1) {
  try {
    return this.method('Reload', {
      _this: moRef(moRef$$1)
    }).then(function () {
      return { reload: true };
    });
  } catch (error) {
    return Promise$1.reject(error);
  }
}

function rename(moRef$$1, name, options) {
  var _this = this;

  if (!_.isString(name)) return Promise$1.reject(new Error('missing name parameter in rename operation'));

  try {
    return this.method('Rename_Task', {
      _this: moRef(moRef$$1),
      newName: name
    }).then(function (task$$1) {
      return _.get(options, 'async') === false ? monitor.task(_this, _.get(task$$1, 'value'), options) : task$$1;
    });
  } catch (error) {
    return Promise$1.reject(error);
  }
}

var TraversalSpec = function () {
  function TraversalSpec(_ref) {
    var type = _ref.type,
        path = _ref.path;
    classCallCheck(this, TraversalSpec);

    this.type = type;
    this.path = path;
  }

  createClass(TraversalSpec, [{
    key: "spec",
    get: function get$$1() {
      return {
        // name: `${this.type}${Date.now()}`,
        type: this.type,
        path: this.path,
        skip: false
      };
    }
  }]);
  return TraversalSpec;
}();

var TraversalSpec$1 = function (obj) {
  return new TraversalSpec(obj);
};

var SelectionSpec = function () {
  function SelectionSpec(obj) {
    classCallCheck(this, SelectionSpec);

    this.obj = obj;
  }

  createClass(SelectionSpec, [{
    key: 'spec',
    get: function get$$1() {
      if (_.has(this.obj, 'listSpec.type') && _.has(this.obj, 'listSpec.path')) {
        return TraversalSpec$1(this.obj.listSpec).spec;
      }
      return {
        name: _.get(this.obj, 'name')
      };
    }
  }]);
  return SelectionSpec;
}();

var SelectionSpec$1 = function (obj) {
  return new SelectionSpec(obj);
};

var ObjectSpec = function () {
  function ObjectSpec(obj) {
    classCallCheck(this, ObjectSpec);

    this.obj = obj;
  }

  createClass(ObjectSpec, [{
    key: 'spec',
    get: function get$$1() {
      var _this = this;

      if (!this.obj.id.length) {
        return [{
          obj: this.obj.containerView ? this.obj.containerView : moRef(this.obj.listSpec.type, this.obj.listSpec.id),
          skip: true,
          selectSet: [SelectionSpec$1(this.obj).spec]
        }];
      } else {
        return _.map(this.obj.id, function (id) {
          return { obj: moRef(_this.obj.type, id) };
        });
      }
    }
  }]);
  return ObjectSpec;
}();

var ObjectSpec$1 = function (obj) {
  return new ObjectSpec(obj);
};

var PropertySpec = function () {
  function PropertySpec(obj) {
    classCallCheck(this, PropertySpec);

    this.obj = obj;
  }

  createClass(PropertySpec, [{
    key: "spec",
    get: function get$$1() {
      var hasProps = this.obj.properties.length > 0;
      return {
        all: !hasProps,
        pathSet: this.obj.properties,
        type: this.obj.type
      };
    }
  }]);
  return PropertySpec;
}();

var PropertySpec$1 = function (obj) {
  return new PropertySpec(obj);
};

var PropertyFilterSpec = function () {
  function PropertyFilterSpec(obj, client) {
    classCallCheck(this, PropertyFilterSpec);

    this.obj = obj;
    this.client = client;
  }

  createClass(PropertyFilterSpec, [{
    key: 'spec',
    get: function get$$1() {
      var _this = this;

      var type = null,
          container = null,
          recursive = null;

      var resolveView = Promise$1.resolve(null);
      var viewManager = this.client.serviceContent.viewManager;

      if (!this.obj.id.length) {
        type = this.obj.type;
        container = this.client.serviceContent.rootFolder;
        recursive = true;
      } else if (!this.obj.type) {
        return Promise$1.reject('Missing required argument "type"');
      }

      type = type || this.obj.type;
      container = container || this.obj.container || this.client.serviceContent.rootFolder;
      recursive = this.obj.recursive === false ? false : true;

      var listSpec = _.get(types, '["' + this.client.apiVersion + '"]["' + type + '"].listSpec');
      if (!listSpec && !this.obj.id.length) {
        return Promise$1.reject('Unable to list vSphere type, try with a specific object id');
      }

      // get the container view if no object specified
      // this is used for listing entire collections of object types
      if (!this.obj.id.length && listSpec.type === 'ContainerView') {
        resolveView = this.client.method('CreateContainerView', { _this: viewManager, container: container, type: type, recursive: recursive });
      }

      return resolveView.then(function (containerView) {
        _this.obj.containerView = containerView;
        _this.obj.listSpec = listSpec;

        var objectSet = ObjectSpec$1(_this.obj).spec;
        var propSet = [PropertySpec$1(_this.obj).spec];
        return { objectSet: objectSet, propSet: propSet };
      });
    }
  }]);
  return PropertyFilterSpec;
}();

var PropertyFilterSpec$1 = function (obj, client) {
  return new PropertyFilterSpec(obj, client);
};

function graphSpec(specSet) {
  var types = {};

  _.forEach(_.isArray(specSet) ? specSet : [specSet], function (spec) {
    if (_.isString(spec)) spec = { type: spec };
    if (!spec.type) return;
    if (!_.has(types, spec.type)) _.set(types, spec.type, { ids: [], props: [] });
    if (spec.id) {
      var ids = _.isArray(spec.id) ? spec.id : [spec.id];
      types[spec.type].ids = _.union(types[spec.type].ids, ids);
    }
    if (spec.properties) {
      var props = _.isArray(spec.properties) ? spec.properties : [spec.properties];
      types[spec.type].props = _.union(types[spec.type].props, props);
    }
  });

  return _.map(types, function (obj, type) {
    return {
      type: type,
      id: obj.ids,
      properties: obj.props
    };
  });
}

function convertRetrievedProperties(results, moRef) {
  var objs = _.get(results, 'objects') || _.get(results, 'returnval.objects');

  return _.map(_.isArray(objs) ? objs : [], function (result) {
    var obj = moRef ? { moRef: result.obj } : {};
    _.forEach(result.propSet, function (prop) {
      _.set(obj, prop.name, prop.val);
    });
    return obj;
  });
}

function orderDoc(doc) {
  return {
    fields: _.keys(doc),
    directions: _.map(doc, function (dir) {
      return dir === 'desc' || dir === -1 ? 'desc' : 'asc';
    })
  };
}

function getResults(result, objects, limit, skip, nth, orderBy, moRef, fn) {
  var _this2 = this;

  if (!result) return Promise$1.resolve(objects);
  var objs = _.union(objects, convertRetrievedProperties(result, moRef));
  var _this = this.serviceContent.propertyCollector;

  if (result.token) {
    return this.method('ContinueRetrievePropertiesEx', { _this: _this, token: result.token }).then(function (results) {
      return getResults.call(_this2, results, objs, limit, skip, nth, orderBy, moRef, fn);
    });
  }

  objs = orderBy ? _.orderBy(objs, orderBy.fields, orderBy.directions) : objs;

  if (nth !== null) {
    return Promise$1.resolve(_.nth(objs, nth));
  }

  var results = _.slice(objs, skip || 0, limit || objs.length);
  return Promise$1.resolve(fn(results));
}

function retrieve(args, options) {
  var _this3 = this;

  args = _.isObject(args) ? args : {};
  options = _.isObject(options) ? options : {};

  var limit = options.limit;
  var skip = options.skip || 0;
  var nth = _.isNumber(options.nth) ? Math.ceil(options.nth) : null;
  var properties = _.get(args, 'properties', []);
  var moRef = true; // _.includes(properties, 'moRef') || _.includes(properties, 'id')
  var orderBy = options.orderBy ? orderDoc(options.orderBy) : null;
  var fn = _.isFunction(options.resultHandler) ? options.resultHandler : function (result) {
    return result;
  };
  args.properties = _.without(properties, 'moRef', 'id', 'moRef.value', 'moRef.type');

  if (_.isNumber(skip) && _.isNumber(limit)) limit += skip;

  var retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties';
  var specMap = _.map(graphSpec(args), function (s) {
    return PropertyFilterSpec$1(s, _this3).spec;
  });
  var _this = this.serviceContent.propertyCollector;

  return Promise$1.all(specMap).then(function (specSet) {
    return _this3.method(retrieveMethod, { _this: _this, specSet: specSet, options: {} }).then(function (result) {
      return getResults.call(_this3, result, [], limit, skip, nth, orderBy, moRef, fn);
    });
  });
}

var methods = {
  destroy: destroy,
  login: login,
  logout: logout,
  method: method,
  reload: reload,
  rename: rename,
  retrieve: retrieve
};

var debug = Debug('vconnect.changefeed');

var DEFAULT_INTERVAL_MS = 10000;
var CREATED = 'enter';
var UPDATED = 'modify';
var DESTROYED = 'leave';
var CHANGE = 'change';

function getId(obj) {
  var moRef = obj.moRef || obj.obj;
  return _.get(moRef, 'type', 'unknown') + '-' + _.get(moRef, 'value', 'unknown');
}

function formatChange(obj) {
  var val = {
    moRef: obj.obj
  };
  _.forEach(obj.changeSet, function (change) {
    _.set(val, change.name, change.val);
  });

  return val;
}

var ChangeFeed = function () {
  function ChangeFeed(client, request, options) {
    var _this2 = this;

    classCallCheck(this, ChangeFeed);

    debug('creating a new changefeed');
    debug('args %O', request.args);
    debug('options %O', request.options);

    this._client = client;
    this._request = request;
    this._options = options;
    this._interval = null;
    this._emitter = new EventEmitter();
    this._observable = Rx.Observable.fromEvent(this._emitter, CHANGE).finally(function () {
      _this2.close();
    });

    debug('using method %s', this._waitMethod);

    var intervalMS = _.get(options, 'interval');
    this._intervalMS = _.isNumber(intervalMS) ? Math.ceil(intervalMS) : DEFAULT_INTERVAL_MS;

    debug('using interval %d', this._intervalMS);

    this.collector = {};
    this.version = '';
    this.currentVal = {};
    this.updating = false;
  }

  createClass(ChangeFeed, [{
    key: 'close',
    value: function close() {
      this._emitter.removeAllListeners();
      clearTimeout(this._interval);
    }
  }, {
    key: 'create',
    value: function create() {
      var _this3 = this;

      this._request.term.then(function () {
        var reqArgs = _.cloneDeep(_this3._request.args) || {};
        reqArgs.properties = reqArgs.properties || [];
        reqArgs.properties = _.without(reqArgs.properties, 'moRef', 'id');
        var specMap = _.map(graphSpec(reqArgs), function (s) {
          return PropertyFilterSpec$1(s, _this3._client).spec;
        });
        var _this = _this3._client.serviceContent.propertyCollector;
        _this3._VimPort = _this3._client._VimPort;
        _this3._waitMethod = _this3._VimPort.WaitForUpdatesEx ? 'WaitForUpdatesEx' : 'WaitForUpdates';

        return Promise$1.all(specMap).then(function (specSet) {
          debug('specMap %j', specSet);
          return _this3._client.method('CreatePropertyCollector', { _this: _this }).then(function (_this) {
            _this3.collector = _this;
            return Promise$1.each(specSet, function (spec) {
              return _this3._client.method('CreateFilter', { _this: _this, spec: spec, partialUpdates: false });
            });
          });
        }).then(function () {
          return _this3.update().then(function () {
            _this3._interval = setInterval(function () {
              _this3.update();
            }, _this3._intervalMS);
          });
        });
      });

      return this._observable;
    }
  }, {
    key: 'diff',
    value: function diff(set$$1, firstRun) {
      var _this4 = this;

      var objectSet = _.get(set$$1, 'filterSet[0].objectSet');

      if (firstRun) {
        _.forEach(objectSet, function (obj) {
          _this4.currentVal[getId(obj)] = formatChange(obj);
        });
      } else {
        var creates = {};
        var destroys = [];
        var updates = {};

        var changes = _.map(objectSet, function (obj) {
          var id = getId(obj);
          var change = {
            old_val: null,
            new_val: null
          };

          if (obj.kind === CREATED) {
            change.new_val = formatChange(obj);
            _.set(creates, id, change.new_val);
          } else {
            var newVal = _.cloneDeep(_.get(_this4.currentVal, id, {}));
            change.old_val = _.cloneDeep(newVal);

            if (obj.kind === DESTROYED) {
              destroys.push(id);
            } else if (obj.kind === UPDATED) {
              _.forEach(obj.changeSet, function (_ref) {
                var name = _ref.name,
                    op = _ref.op,
                    val = _ref.val;

                switch (op) {
                  case 'add':
                    _.set(newVal, name, val);
                    break;
                  case 'remove':
                    _.unset(newVal, name, val);
                    break;
                  case 'assign':
                    _.set(newVal, name, val);
                    break;
                  case 'indirectRemove':
                    _.unset(newVal, name, val);
                    break;
                  default:
                    break;
                }
              });
              _.set(updates, id, newVal);
              change.new_val = newVal;
            } else {
              debug('unhandled kind %s', obj.kind);
            }
          }

          return change;
        });

        // add creates
        _.forEach(creates, function (change, id) {
          _.set(_this4.currentVal, id, change);
        });

        // set updates
        _.forEach(updates, function (change, id) {
          _.set(_this4.currentVal, id, change);
        });

        // remove destroyed
        _.forEach(destroys, function (id) {
          _.unset(_this4.currentVal, id);
        });

        return changes;
      }
    }
  }, {
    key: 'update',
    value: function update() {
      var _this5 = this;

      if (this.updating) return; // prevent concurrent calls to update
      this.updating = true;
      debug('update running');
      return this._client.method(this._waitMethod, {
        _this: this.collector,
        version: this.version,
        options: {
          maxWaitSeconds: 0
        }
      }).then(function (set$$1) {
        _this5.updating = false;
        if (!set$$1) return;
        _this5.version = set$$1.version;

        if (_this5.version === '1') {
          if (_.isEmpty(_this5.currentVal)) _this5.diff(set$$1, true);
        } else {
          _.forEach(_this5.diff(set$$1), function (change) {
            _this5._emitter.emit(CHANGE, change);
          });
        }
      }, function (error) {
        _this5._emitter.emit(CHANGE, error);
        _this5.updating = false;
      });
    }
  }]);
  return ChangeFeed;
}();

var OPERATIONS = {
  RETRIEVE: 'RETRIEVE',
  LOGOUT: 'LOGOUT',
  TYPE: 'TYPE',
  PLUCK: 'PLUCK',
  MAP: 'MAP',
  REDUCE: 'REDUCE',
  FILTER: 'FILTER',
  EACH: 'EACH',
  GET: 'GET',
  GETALL: 'GETALL',
  EQ: 'EQ',
  NE: 'NE',
  GT: 'GT',
  LT: 'LT',
  LTE: 'LTE',
  GTE: 'GTE',
  NOT: 'NOT',
  EXPR: 'EXPR',
  DO: 'DO'
};

function makeDotPath(obj) {
  var list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  _.forEach(obj, function (val, key) {
    var prop = path.slice(0);
    prop.push(key);
    if (val === true) list.push(prop.join('.'));else makeDotPath(val, list, prop);
  });
  return list;
}

function buildPropList(args) {
  var props = [];
  _.forEach(args, function (arg) {
    if (_.isString(arg)) props = _.union(props, [arg]);else if (_.isArray(arg)) props = _.union(props, arg);else if (_.isObject(arg)) props = _.union(props, makeDotPath(arg));
  });
  return props;
}

function pluckProperties(obj, props) {
  return _.reduce(props, function (o, prop) {
    return _.set(o, prop, _.get(obj, prop));
  }, {});
}

function pluck(obj, props) {
  return _.isArray(obj) ? _.map(obj, function (o) {
    return pluckProperties(o, props);
  }) : pluckProperties(obj, props);
}

/**
 * returns a new request context built from the existing
 * @param target
 * @param source
 * @param obj
 * @param term
 */
function assignRequest(target, source) {
  var obj = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var term = arguments[3];

  _.merge(target, _.omit(source, ['term']), obj);
  if (term == true) target.term = source.term;
}

/**
 * processes the current term promise and updates the context
 * @param handler
 * @param obj
 * @return {v}
 */
function processTerm(handler) {
  var _this = this;

  var obj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var isDefault = arguments[2];

  var req = {
    term: this._request.term.then(function (value) {
      assignRequest(req, _this._request, obj);
      if (_this._request.error && !isDefault) return null;
      if (isDefault) req.error = null;
      return handler(value, req);
    })
  };
  return new v(this._client, req);
}

/**
 * recursively processes the branch statements
 * @param args
 * @param resolve
 * @param reject
 * @return {*|Promise.<*>|Promise.<TResult>}
 */
function processBranch(args, resolve, reject) {
  var condition = args.shift();
  var val = args.shift();
  var las = _.last(args);

  return Promise$1.resolve(condition).then(function (c) {
    if (c === true) {
      return Promise$1.resolve(_.isFunction(val) ? val() : val).then(resolve, reject);
    } else if (args.length === 1) {
      return Promise$1.resolve(_.isFunction(las) ? las() : las).then(resolve, reject);
    } else {
      return processBranch(args, resolve, reject);
    }
  }, reject);
}

/**
 * retrieves records and clears out the request context
 * @param req
 * @return {*|Promise.<*>}
 */
function performRetrieve(req) {
  return this._client.retrieve(req.args, req.options).then(function (result) {
    req.args = {};
    req.options = {};
    return result;
  });
}

var v = function () {
  function v(client, request) {
    classCallCheck(this, v);

    var term = function term(field) {
      return _.isString(field) ? term.value(field) : processTerm.call(this, function (result) {
        return result;
      });
    };
    Object.setPrototypeOf(term, v.prototype);

    term._client = client;
    term._request = _.isObject(request) ? request : {};
    term._request.term = term._request.term || client._connection;
    term._request.error = term._request.error || null;
    return term;
  }

  /**
   * updates the request to return all fields
   * @return {*}
   */


  createClass(v, [{
    key: 'allData',
    value: function allData() {
      return processTerm.call(this, function (value, req) {
        _.set(req, 'args.properties', []);
        return value;
      });
    }

    /**
     * performs a branch operation
     * @return {*}
     */

  }, {
    key: 'branch',
    value: function branch() {
      var args = [].concat(Array.prototype.slice.call(arguments));
      return processTerm.call(this, function (value, req) {
        req.operation = null;
        args = args.length === 2 ? _.union([value], args) : args;

        if (args.length < 3 || args.length % 2 !== 1) {
          req.error = new Error('branch has an invalid number of arguments');
          return;
        }
        return new Promise$1(function (resolve, reject) {
          return processBranch(args, resolve, reject);
        });
      });
    }

    /**
     * creates a new changefeed
     * @param options
     * @return {*}
     */

  }, {
    key: 'changes',
    value: function changes(options) {
      return new ChangeFeed(this._client, this._request, options).create();
    }

    /**
     * Completes the connection process and returns the backend client
     * @return {*|Promise.<VsphereConnectClient>}
     */

  }, {
    key: 'createClient',
    value: function createClient() {
      var _this2 = this;

      return this._client._connection.then(function () {
        return _this2._client;
      });
    }

    /**
     * default to a value if one does not exist
     * @param val
     * @return {*}
     */

  }, {
    key: 'default',
    value: function _default(val) {
      return processTerm.call(this, function (result, req) {
        var error = req.error ? req.error : result === undefined ? new Error('NoResultsError: the selection has no results') : null;
        req.error = null;

        return error ? _.isFunction(val) ? val(error) : val : result;
      }, {}, true);
    }

    /**
     * destroys a selection of objects
     * @param options
     * @return {*}
     */

  }, {
    key: 'destroy',
    value: function destroy(options) {
      var _this3 = this;

      return processTerm.call(this, function (result, req) {
        var args = _.get(req, 'args', {});
        var opts = _.get(req, 'options', {});

        var arrayResults = !_.isNumber(opts.nth) && opts.limit !== 1 && (!args.id || _.isArray(args.id) && args.id.length);

        return performRetrieve.call(_this3, req).then(function (results) {
          return Promise$1.map(results, function (res) {
            return _this3._client.destroy(res.moRef, options);
          });
        }).then(function (results) {
          return arrayResults ? results : _.first(results);
        });
      });
    }

    /**
     * performs a nested operation
     * @return {*}
     */

  }, {
    key: 'do',
    value: function _do() {
      var args = [].concat(Array.prototype.slice.call(arguments));
      var fn = _.last(args);
      if (!_.isFunction(fn)) throw new Error('invalid value for do');
      return processTerm.call(this, function (value, req) {
        var params = args.length > 1 ? args.slice(0, args.length - 1) : [value];
        return Promise$1.map(params, function (param) {
          return param;
        }).then(function (params) {
          req.operation = OPERATIONS.DO;
          return fn.apply(null, params);
        });
      });
    }

    /**
     * loops through a collection and performs the iteratee function
     * @param iteratee
     * @return {*}
     */

  }, {
    key: 'each',
    value: function each(iteratee) {
      var _this4 = this;

      iteratee = _.isFunction(iteratee) ? iteratee : _.identity;
      return processTerm.call(this, function (value, req) {
        var data = value;
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            data = performRetrieve.call(_this4, req);
            break;
          default:
            break;
        }
        return Promise$1.each(data, iteratee).then(function (result) {
          req.operation = OPERATIONS.EACH;
          return result;
        });
      });
    }

    /**
     * compares passed value to current value
     * @param val
     * @return {*}
     */

  }, {
    key: 'eq',
    value: function eq(val) {
      var _this5 = this,
          _arguments = arguments;

      return processTerm.call(this, function (value, req) {
        var data = value;
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            data = performRetrieve.call(_this5, req);
            break;
          default:
            break;
        }
        return Promise$1.resolve(data).then(function (compare) {
          return Promise$1.reduce([].concat(Array.prototype.slice.call(_arguments)), function (accum, item) {
            return accum && _.isEqual(compare, item);
          }, true);
        }).then(function (result) {
          req.operation = OPERATIONS.EQ;
          return result;
        });
      });
    }

    /**
     * creates a new expression
     * @param val
     * @return {*}
     */

  }, {
    key: 'expr',
    value: function expr(val) {
      return processTerm.call(this, function (value, req) {
        req.operation = OPERATIONS.EXPR;
        return val;
      });
    }

    /**
     * Filters a collection
     * @param iteratee
     * @param options
     * @return {*}
     */

  }, {
    key: 'filter',
    value: function filter(iteratee, options) {
      var _this6 = this;

      iteratee = _.isFunction(iteratee) ? iteratee : _.identity;
      return processTerm.call(this, function (value, req) {
        var data = value;
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            data = performRetrieve.call(_this6, req);
            break;
          default:
            break;
        }
        return Promise$1.filter(data, iteratee, options).then(function (result) {
          req.operation = OPERATIONS.FILTER;
          return result;
        });
      });
    }

    /**
     * gets one or more objects by id
     * @param id
     * @return {*}
     */

  }, {
    key: 'get',
    value: function get$$1() {
      var _this7 = this;

      var ids = [].concat(Array.prototype.slice.call(arguments));
      return processTerm.call(this, function (value, req) {
        _.set(req, 'args.id', ids);
        return performRetrieve.call(_this7, req).then(function (result) {
          req.operation = OPERATIONS.GET;
          return ids.length > 1 ? result : _.get(result, '[0]', null);
        });
      });
    }

    /**
     * returns the id value from the current selection
     * @return {*}
     */

  }, {
    key: 'id',
    value: function id() {
      return processTerm.call(this, function (value, req) {
        req.operation = null;
        return _.isArray(value) ? _.map(value, function (v) {
          return _.get(v, 'moRef.value', null);
        }) : _.get(value, 'moRef.value', null);
      });
    }

    /**
     * Limits the number of records returned
     * @param limit
     * @return {*}
     */

  }, {
    key: 'limit',
    value: function limit(_limit) {
      if (!_.isNumber(_limit)) throw new Error('invalid value for limit');
      return processTerm.call(this, function (value, req) {
        _.set(req, 'options.limit', Math.ceil(_limit));
        return value;
      });
    }

    /**
     * logs the user in or changes the token
     * @param username
     * @param password
     * @return {*}
     */

  }, {
    key: 'login',
    value: function login(username, password) {
      var _this8 = this;

      return processTerm.call(this, function (value, req) {
        return _this8._client.login(username, password);
      });
    }

    /**
     * Logs out of the current vSphere session
     * @return {*|Promise.<Object>}
     */

  }, {
    key: 'logout',
    value: function logout() {
      return this._request.term.then(this._client.logout());
    }

    /**
     * performs a map operation
     * @param iteratee
     * @return {*}
     */

  }, {
    key: 'map',
    value: function map(iteratee, options) {
      var _this9 = this;

      iteratee = _.isFunction(iteratee) ? iteratee : _.identity;
      return processTerm.call(this, function (value, req) {
        var data = value;
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            data = performRetrieve.call(_this9, req);
            break;
          default:
            break;
        }
        return Promise$1.map(data, iteratee, options).then(function (result) {
          req.operation = OPERATIONS.MAP;
          return result;
        });
      });
    }

    /**
     * interact directly with the vsphere api
     * @param name
     * @param args
     * @return {*}
     */

  }, {
    key: 'method',
    value: function method(name, args) {
      var _this10 = this;

      return processTerm.call(this, function (value, req) {
        return _this10._client.method(name, args).then(function (result) {
          req.operation = null;
          return result;
        });
      });
    }

    /**
     * compares passed value to current value
     * @param val
     * @return {*}
     */

  }, {
    key: 'ne',
    value: function ne(val) {
      var _this11 = this,
          _arguments2 = arguments;

      return processTerm.call(this, function (value, req) {
        var data = value;
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            data = performRetrieve.call(_this11, req);
            break;
          default:
            break;
        }
        var expr = _this11.expr(data);
        return expr.eq.apply(expr, [].concat(Array.prototype.slice.call(_arguments2))).not();
      });
    }

    /**
     * does a not operation on the current value
     * @return {*}
     */

  }, {
    key: 'not',
    value: function not() {
      return processTerm.call(this, function (value, req) {
        req.operation = OPERATIONS.NOT;
        return !_.includes([true, 1, "true", "TRUE"], value);
      });
    }

    /**
     * Gets a specific record from a list of records
     * @param index
     */

  }, {
    key: 'nth',
    value: function nth(index) {
      if (!_.isNumber(index)) throw new Error('invalid value for nth');
      return processTerm.call(this, function (value, req) {
        _.set(req, 'options.nth', Math.ceil(index));
        return value;
      });
    }

    /**
     * Orders the results
     * @param doc
     * @return {*}
     */

  }, {
    key: 'orderBy',
    value: function orderBy(doc) {
      return processTerm.call(this, function (value, req) {
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            _.set(req, 'options.orderBy', doc);
            break;
          default:
            var orderBy = orderDoc(doc);
            value = _.orderBy(value, orderBy.fields, orderBy.directions);
            break;
        }
        return value;
      });
    }

    /**
     * Filters down the fields that will be returned
     * @return {v}
     */

  }, {
    key: 'pluck',
    value: function pluck$$1() {
      var propList = buildPropList([].concat(Array.prototype.slice.call(arguments)));
      return processTerm.call(this, function (value, req) {
        var currentProps = _.get(req, 'args.properties', propList);
        var useProps = _.intersection(propList, currentProps);
        useProps = useProps.length ? useProps : propList;

        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            _.set(req, 'args.properties', useProps);
            return value;
          default:
            return pluck(value, useProps);
        }
      });
    }

    /**
     * call the clients retrieve method directly
     * @param args
     * @param options
     * @return {*}
     */

  }, {
    key: 'retrieve',
    value: function retrieve(args, options) {
      var _this12 = this;

      return processTerm.call(this, function (value, req) {
        return _this12._client.retrieve(args, options).then(function (result) {
          req.operation = null;
          return result;
        });
      });
    }

    /**
     * selects a value from the current result
     * @param p
     * @return {*}
     */

  }, {
    key: 'value',
    value: function value(p) {
      var _this13 = this;

      return processTerm.call(this, function (value, req) {
        var data = Promise$1.resolve(value);
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            data = performRetrieve.call(_this13, req);
            break;
          default:
            break;
        }
        return data.then(function (result) {
          req.operation = null;

          if (_.isString(p)) {
            if (_.isArray(result)) {
              return _.without(_.map(result, function (res) {
                return _.get(res, p);
              }), undefined);
            } else {
              var val = _.get(result, p);
              if (val === undefined) {
                req.error = new Error('no attribute "' + p + '" in object');
              }
              return val;
            }
          }
          return result;
        });
      });
    }

    /**
     * performs a reduce operation
     * @param iteratee
     * @param initialValue
     * @return {*}
     */

  }, {
    key: 'reduce',
    value: function reduce(iteratee, initialValue) {
      var _this14 = this;

      iteratee = _.isFunction(iteratee) ? iteratee : _.identity;
      return processTerm.call(this, function (value, req) {
        var data = value;
        switch (req.operation) {
          case OPERATIONS.RETRIEVE:
            data = performRetrieve.call(_this14, req);
            break;
          default:
            break;
        }
        return Promise$1.reduce(data, iteratee, initialValue).then(function (result) {
          req.operation = OPERATIONS.REDUCE;
          return result;
        });
      });
    }

    /**
     * Limits the number of records returned
     * @param count
     * @return {*}
     */

  }, {
    key: 'skip',
    value: function (_skip) {
      function skip(_x3) {
        return _skip.apply(this, arguments);
      }

      skip.toString = function () {
        return _skip.toString();
      };

      return skip;
    }(function (count) {
      if (!_.isNumber(count)) throw new Error('invalid value for skip');
      return processTerm.call(this, function (value, req) {
        _.set(req, 'options.skip', Math.ceil(skip));
        return value;
      });
    })

    /**
     * Sets the current type
     * @param name
     * @return {v}
     */

  }, {
    key: 'type',
    value: function type(name) {
      var _this15 = this;

      return processTerm.call(this, function (value, req) {
        var type = _this15._client.typeResolver(name);
        var operation = OPERATIONS.RETRIEVE;
        if (!type) {
          req.error = new Error('invalid type ' + name);
          return;
        }
        assignRequest(req, _this15._request, { operation: operation, type: type });
        _.set(req, 'args.type', type);
        _.set(req, 'args.properties', ['moRef', 'name']);
        return value;
      });
    }

    /**
     * Performs the chain of operations
     * @param onFulfilled
     * @param onRejected
     * @return {*|Promise.<*>}
     */

  }, {
    key: 'then',
    value: function then(onFulfilled, onRejected) {
      var _this16 = this;

      onFulfilled = _.isFunction(onFulfilled) ? onFulfilled : _.noop;
      onRejected = _.isFunction(onRejected) ? onRejected : _.noop;

      return this._request.term.then(function (value) {
        if (_this16._request.error) throw _this16._request.error;

        switch (_this16._request.operation) {
          case OPERATIONS.RETRIEVE:
            return _this16._client.retrieve(_this16._request.args, _this16._request.options).then(onFulfilled, onRejected);

          default:
            return onFulfilled(value);
        }
        throw new Error('UnsupportedOperation: ' + _this16._request.operation);
      }, onRejected);
    }
  }]);
  return v;
}();

var VsphereConnectClient = function (_EventEmitter) {
  inherits(VsphereConnectClient, _EventEmitter);

  /**
   *
   * @param host {String} - viServer
   * @param [options] {Object} - connection options
   * @param [options.ignoreSSL=false] {Boolean} - ignores invalid ssl
   * @param [options.cacheKey] {Function} - cache key function whose return value will be used as the cache key name
   * @return {v}
   */
  function VsphereConnectClient(host, options) {
    var _ret;

    classCallCheck(this, VsphereConnectClient);

    var _this = possibleConstructorReturn(this, (VsphereConnectClient.__proto__ || Object.getPrototypeOf(VsphereConnectClient)).call(this));

    _this.loggedIn = false;

    if (!_.isString(host) || _.isEmpty(host)) throw new Error('missing required parameter "host"');

    options = _.isObject(options) && !_.isArray(options) ? options : {};

    options.cacheKey = _.isFunction(options.cacheKey) ? options.cacheKey : cacheKey;

    if (options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    _this._connection = soap.createClient('https://' + host + '/sdk/vimService.wsdl', options).then(function (client) {
      _this._soapClient = client;
      _this._VimPort = _.get(client, 'services.VimService.VimPort');

      return _this._VimPort.RetrieveServiceContent({
        _this: {
          type: 'ServiceInstance',
          value: 'ServiceInstance'
        }
      });
    }).then(function (result) {
      _this.serviceContent = _.get(result, 'returnval');
      _this.apiVersion = _.get(_this.serviceContent, 'about.apiVersion');
      _this.typeResolver = typeResolver(_this.apiVersion);
      return { connected: true };
    });

    return _ret = new v(_this), possibleConstructorReturn(_this, _ret);
  }

  createClass(VsphereConnectClient, [{
    key: 'setSecurity',
    value: function setSecurity(securityObject) {
      this._soapClient.setSecurity(securityObject);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      return methods.destroy.apply(this, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'login',
    value: function login() {
      return methods.login.apply(this, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'logout',
    value: function logout() {
      return methods.logout.apply(this, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'method',
    value: function method() {
      return methods.method.apply(this, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'reload',
    value: function reload() {
      return methods.reload.apply(this, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'rename',
    value: function rename() {
      return methods.rename.apply(this, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'retrieve',
    value: function retrieve() {
      return methods.retrieve.apply(this, [].concat(Array.prototype.slice.call(arguments)));
    }
  }]);
  return VsphereConnectClient;
}(EventEmitter);

var index = function (host, options) {
  return new VsphereConnectClient(host, options);
};

module.exports = index;
