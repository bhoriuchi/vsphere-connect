'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var EventEmitter = _interopDefault(require('events'));
var Promise$1 = _interopDefault(require('bluebird'));
var soap = _interopDefault(require('soap-connect'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











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





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

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
    return possibleConstructorReturn(this, (InvalidMethodError.__proto__ || Object.getPrototypeOf(InvalidMethodError)).call(this, 'InvalidMethodError', ERR_INVALID_METHOD, message + ' is not a valid method'));
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

var Errors = {
  InvalidMethodError: InvalidMethodError,
  InvalidTypeError: InvalidTypeError,
  MissingPropertiesError: MissingPropertiesError,
  ObjectReferenceError: ObjectReferenceError,
  VSphereConnectError: VSphereConnectError
};

function createCluster(args, options) {
  var _ref = _.isObject(args) ? args : {},
      folder = _ref.folder,
      name = _ref.name,
      spec = _ref.spec;

  var _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder;
  spec = _.isObject(spec) ? spec : {};
  options = _.isObject(options) ? options : {};

  return name ? this.method('CreateClusterEx', { _this: _this, name: name, spec: spec }) : Promise$1.reject(new Error('create datacenter requires a name'));
}

function createDatacenter(args, options) {
  var _ref = _.isObject(args) ? args : {},
      folder = _ref.folder,
      name = _ref.name;

  var _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder;
  options = _.isObject(options) ? options : {};

  return name ? this.method('CreateDatacenter', { _this: _this, name: name }) : Promise$1.reject(new Error('create datacenter requires name'));
}

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

function convertRetrievedProperties(results) {
  var objs = _.get(results, 'objects') || _.get(results, 'returnval.objects');

  return _.map(_.isArray(objs) ? objs : [], function (result) {
    var obj = { moRef: result.obj };
    _.forEach(result.propSet, function (prop) {
      _.set(obj, prop.name, prop.val);
    });
    return obj;
  });
}

function errorHandler(err, callback, reject) {
  callback(err);
  return reject(err);
}

function extractMoRef(args) {
  var type = args.type,
      id = args.id,
      moRef = args.moRef;

  var moRefError = null;

  if (_.isObject(moRef)) {
    type = moRef.type;
    id = moRef.value;
  }

  var typeName = this.typeResolver(type);

  if (!typeName) moRefError = new InvalidTypeError(type);else if (!id) moRefError = new ObjectReferenceError();

  return {
    moRefError: moRefError,
    typeName: typeName,
    id: id,
    moRef: {
      type: typeName,
      value: id
    }
  };
}

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

function moRef(typeValue, value) {
  if (_.isObject(typeValue) && !value) {
    var type = typeValue.type,
        _value = typeValue.value,
        id = typeValue.id;

    if (!type && !_value && !id) return new Error('cannot resolve moRef, missing type info');
  }
  return { type: typeValue, value: value };
}

function pluckProperties(obj, props) {
  var o = {};
  _.forEach(props, function (prop) {
    _.set(o, prop, _.get(obj, prop));
  });
  return o;
}

function pluck(obj, props) {
  if (_.isArray(obj)) return _.map(function (o) {
    return pluckProperties(o, props);
  });
  return pluckProperties(obj, props);
}

function resultHandler(result, callback, resolve) {
  callback(null, result);
  return resolve(result);
}

/*
 * Basic non-strict (allows 5, 5.0 as versions) semver tools
 */

function parse(s) {
  var _s$split = s.split('.'),
      _s$split2 = slicedToArray(_s$split, 3),
      major = _s$split2[0],
      minor = _s$split2[1],
      patch = _s$split2[2];

  major = !isNaN(major) ? parseInt(major) : null;
  minor = !minor ? 0 : !isNaN(minor) ? parseInt(minor) : null;
  patch = !patch ? 0 : !isNaN(patch) ? parseInt(patch) : null;
  if (!major) return null;
  return {
    version: major + '.' + minor + '.' + patch,
    major: major,
    minor: minor,
    patch: patch
  };
}

function gt(a, b) {
  var verA = parse(a);
  var verB = parse(b);
  if (verA.major < verB.major) return false;
  if (verA.major === verB.major) {
    if (verA.minor < verB.minor) return false;
    if (verA.minor === verB.minor) {
      if (verA.patch < verB.patch) return false;
    }
  }
  return true;
}

function lt(a, b) {
  var verA = parse(a);
  var verB = parse(b);
  if (verA.major > verB.major) return false;
  if (verA.major === verB.major) {
    if (verA.minor > verB.minor) return false;
    if (verA.minor === verB.minor) {
      if (verA.patch > verB.patch) return false;
    }
  }
  return true;
}

var semver = {
  parse: parse,
  gt: gt,
  lt: lt
};

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

var Utils = {
  buildPropList: buildPropList,
  cacheKey: cacheKey,
  convertRetrievedProperties: convertRetrievedProperties,
  errorHandler: errorHandler,
  extractMoRef: extractMoRef,
  graphSpec: graphSpec,
  makeDotPath: makeDotPath,
  mo: types,
  moRef: moRef,
  pluck: pluck,
  resultHandler: resultHandler,
  semver: semver,
  typeResolver: typeResolver
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

function createDVSwitch(args, options) {
  var _this = this;

  var _ref = _.isObject(args) ? args : {},
      folder = _ref.folder,
      datacenter = _ref.datacenter,
      spec = _ref.spec;

  options = _.isObject(options) ? options : {};

  if (semver.lt(this.apiVersion, '4.0')) return Promise$1.reject(new Error('create dvSwitch requires api 4.0 or higher'));
  if (!spec) return Promise$1.reject(new Error('create dvSwitch requires a spec'));

  if (folder) {
    folder = Promise$1.resolve({ type: 'Folder', value: folder });
  } else if (datacenter) {
    folder = this.retrieve({
      type: 'Datacenter',
      id: datacenter,
      properties: ['networkFolder']
    }).then(function (dc) {
      return _.get(dc, 'networkFolder');
    });
  } else {
    return Promise$1.reject(new Error('datacenter or folder required to create dvSwitch'));
  }

  return folder.then(function (folderRef) {
    return _this.method('CreateDVS_Task', { _this: folderRef, spec: spec }).then(function (task$$1) {
      return options.async !== false ? task$$1 : monitor.task(_this, _.get(task$$1, 'value'), options);
    });
  });
}

function createFolder(args, options) {
  var _ref = _.isObject(args) ? args : {},
      folder = _ref.folder,
      name = _ref.name;

  var _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder;
  options = _.isObject(options) ? options : {};

  if (!name) return Promise$1.reject(new Error('create folder requires name'));

  return this.method('CreateFolder', { _this: _this, name: name });
}

function createStoreCluster(args, options) {
  var _ref = _.isObject(args) ? args : {},
      folder = _ref.folder,
      name = _ref.name;

  var _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder;
  options = _.isObject(options) ? options : {};

  if (!name) return Promise$1.reject(new Error('create folder requires name'));
  if (semver.lt(this.apiVersion, '5.0')) return Promise$1.reject(new Error('storecluster requires api 5.0 or higher'));

  return this.method('CreateStoragePod', { _this: _this, name: name });
}

function createVM(args, options) {
  var _this = this;

  var _ref = _.isObject(args) ? args : {},
      folder = _ref.folder,
      datacenter = _ref.datacenter,
      config = _ref.config,
      pool = _ref.pool,
      host = _ref.host;

  if (!config) return Promise$1.reject(new Error('create vm requires a config'));

  if (folder) {
    folder = Promise$1.resolve({ type: 'Folder', value: folder });
  } else if (datacenter) {
    folder = this.retrieve({
      type: 'Datacenter',
      id: datacenter,
      properties: ['vmFolder']
    }).then(function (dc) {
      return _.get(dc, 'vmFolder');
    });
  } else {
    return Promise$1.reject(new Error('datacenter or folder required to create vm'));
  }

  return folder.then(function (folderRef) {
    return _this.method('CreateVM_Task', { _this: folderRef, config: config, pool: pool, host: host }).then(function (task$$1) {
      return options.async !== false ? task$$1 : monitor.task(_this, _.get(task$$1, 'value'), options);
    });
  });
}

function create(args, options) {
  var type = _.get(args, 'type') || _.get(args, 'moRef.type');

  switch (this.typeResolver(type)) {
    case 'ClusterComputeResource':
      return createCluster.call(this, args, options);

    case 'Datacenter':
      return createDatacenter.call(this, args, options);

    case 'DistributedVirtualSwitch':
      return createDVSwitch.call(this, args, options);

    case 'Folder':
      return createFolder.call(this, args, options);

    case 'StoragePod':
      return createStoreCluster.call(this, args, options);

    case 'VirtualMachine':
      return createVM.call(this, args, options);

    default:
      return Promise$1.reject(new Error('invalid type "' + type + '" specified during create'));
  }
}

function destroy() {
  var _this = this;

  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = arguments[1];

  options = _.isObject(options) ? options : {};
  var type = args.type,
      id = args.id,
      moRef = args.moRef;

  var typeName = this.typeResolver(type);
  var obj = moRef || { type: typeName, value: id };

  if (!moRef && !type && !id) return Promise$1.reject(new Error('no object specified to destroy'));

  return this.method('Destroy_Task', { _this: obj }).then(function (task$$1) {
    return options.async !== false ? task$$1 : monitor.task(_this, _.get(task$$1, 'value'), options);
  });
}

var CookieSecurity = soap.Security.CookieSecurity;

function getToken(headers) {
  return _.get(_.get(headers, 'set-cookie[0]', '').match(/"(.*)"/), '[1]', null);
}

function login(args) {
  var _this = this;

  var _ref = _.isObject(args) ? args : {},
      username = _ref.username,
      password = _ref.password,
      token = _ref.token;

  var isHostAgent = _.get(this, 'serviceContent.about.apiType') === 'HostAgent';

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
        _this._soapClient.setSecurity(CookieSecurity(_this._soapClient.lastResponse.headers));
        _this._token = getToken(_this._soapClient.lastResponse.headers);
        _this._session = session;
        return _this._session;
      });
    }

  return Promise$1.reject('no credentials provided');
}

function logout() {
  return this.method('Logout', { _this: this.serviceContent.sessionManager }).then(function () {
    return { logout: true };
  });
}

function method(name, args) {
  args = _.isObject(args) ? args : {};
  var _method = _.get(this._VimPort, '["' + name + '"]');

  return _.isFunction(_method) ? _method(args).then(function (result) {
    return _.get(result, 'returnval', result);
  }) : Promise$1.reject(new InvalidMethodError(name));
}

function getParent(type, id, parentType, root, resolve, reject) {
  var _this = this;

  var match = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;

  this.retrieve({ type: type, id: id, properties: ['parent'] }).then(function (result) {
    var moRef$$1 = _.get(result, 'parent');
    var hasParent = !_.isEmpty(moRef$$1);
    var atRoot = _.isEqual(_this.serviceContent.rootFolder, moRef$$1);

    if (!root) {
      if (!parentType || parentType === moRef$$1.type) return resolve(moRef$$1);
      if (parentType && hasParent && parentType !== moRef$$1.type) {
        return getParent.call(_this, moRef$$1.type, moRef$$1.id, parentType, root, resolve, reject, match);
      }
      return resolve(match);
    }

    if (atRoot || !hasParent) return resolve(match);
    return getParent.call(_this, moRef$$1.type, moRef$$1.id, parentType, root, resolve, reject, match);
  }, reject);
}

function parent(args, options) {
  var _this2 = this;

  return new Promise$1(function (resolve, reject) {
    options = _.isObject(options) ? options : {};

    var _ref = _.isObject(args) ? args : {},
        root = _ref.root,
        parent = _ref.parent;

    var _extractMoRef = extractMoRef(args),
        typeName = _extractMoRef.typeName,
        id = _extractMoRef.id,
        moRefError = _extractMoRef.moRefError;

    var parentType = parent ? _this2.typeResolver(parent) : null;

    if (moRefError) return reject(moRefError);
    if (parent && !parentType) return reject(new InvalidTypeError(parent));

    return getParent.call(_this2, typeName, id, parentType, root, resolve, reject);
  });
}

function reload(args) {
  var _ref = _.isFunction(args) ? args : {},
      type = _ref.type,
      id = _ref.id,
      moRef = _ref.moRef;

  var typeName = this.typeResolver(type);
  var obj = moRef || { type: typeName, value: id };

  if (!moRef && !type && !id) return Promise$1.reject(new Error('no object specified to reload'));

  return this.method('Reload', { _this: obj }).then(function () {
    return { reload: true };
  });
}

function rename(args, options) {
  var _this = this;

  var _ref = _.isObject(args) ? args : {},
      type = _ref.type,
      id = _ref.id,
      moRef = _ref.moRef,
      name = _ref.name;

  var typeName = this.typeResolver(type);
  var obj = moRef || { type: typeName, value: id };
  options = _.isObject(options) ? options : {};

  if (!moRef && !type && !id) return Promise$1.reject(new Error('no object specified'));
  if (!_.isString(name)) return Promise$1.reject(new Error('invalid name'));

  return this.method('Rename_Task', { _this: obj, newName: name }).then(function (task$$1) {
    return options.async !== false ? task$$1 : monitor.task(_this, _.get(task$$1, 'value'), options);
  });
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

function getResults(result, objects, limit, offset) {
  var _this2 = this;

  if (!result) return Promise$1.resolve(objects);
  var objs = _.union(objects, convertRetrievedProperties(result));
  var _this = this.serviceContent.propertyCollector;

  if (result.token && (limit === undefined || objs.length < limit)) {
    return this.method('ContinueRetrievePropertiesEx', { _this: _this, token: result.token }).then(function (results) {
      return getResults.call(_this2, results, objs, limit, offset);
    });
  }

  var results = _.slice(objs, offset || 0, limit || objs.length);
  return Promise$1.resolve(results);
}

function retrieve(args, options) {
  var _this3 = this;

  args = _.isObject(args) ? args : {};
  options = _.isObject(options) ? options : {};

  var limit = options.limit;
  var offset = options.offset || 0;
  if (_.isNumber(offset) && _.isNumber(limit)) limit += offset;

  var retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties';
  var specMap = _.map(graphSpec(args), function (s) {
    return PropertyFilterSpec$1(s, _this3).spec;
  });
  var _this = this.serviceContent.propertyCollector;

  return Promise$1.all(specMap).then(function (specSet) {
    return _this3.method(retrieveMethod, { _this: _this, specSet: specSet, options: {} }).then(function (result) {
      return getResults.call(_this3, result, [], limit, offset);
    });
  });
}

var methods = {
  create: create,
  destroy: destroy,
  login: login,
  logout: logout,
  method: method,
  parent: parent,
  reload: reload,
  rename: rename,
  retrieve: retrieve
};

function get$1(client, type, id, properties, limit, offset, single) {
  return client.retrieve({ type: type, id: id, properties: properties }, { limit: limit, offset: offset }).then(function (result) {
    return single ? _.get(result, '[0]', null) : result;
  });
}

var RESULT_TYPE = {
  VIM_OBJECT: 'VIM_OBJECT',
  VIM_COLLECTION: 'VIM_COLLECTION',
  OBJECT: 'OBJECT',
  COLLECTION: 'COLLECTION',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  ARRAY: 'ARRAY'
};

var ENUMS = {
  RESULT_TYPE: RESULT_TYPE
};

var _ENUMS$RESULT_TYPE = ENUMS.RESULT_TYPE;
var VIM_OBJECT = _ENUMS$RESULT_TYPE.VIM_OBJECT;
var VIM_COLLECTION = _ENUMS$RESULT_TYPE.VIM_COLLECTION;
var OBJECT = _ENUMS$RESULT_TYPE.OBJECT;
var COLLECTION = _ENUMS$RESULT_TYPE.COLLECTION;
var STRING = _ENUMS$RESULT_TYPE.STRING;
var ARRAY = _ENUMS$RESULT_TYPE.ARRAY;


var CookieSecurity$1 = soap.Security.CookieSecurity;

function query(q) {
  var _this = this;

  var limit = null,
      offset = null,
      id = null,
      folder = null;

  var val = Promise$1.resolve();
  var idx = 0,
      properties = [];
  var _ref = [q._chain, q._chain.length, q._client, q._type],
      chain = _ref[0],
      len = _ref[1],
      client = _ref[2],
      type = _ref[3];

  var resultType = type ? VIM_COLLECTION : null;
  type = type ? client.typeResolver(type) : type;

  // check for a new instantiation
  if (!len) {
    return type ? client.retrieve({ type: type }) : Promise$1.reject(new Error('Invalid query chain'));
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var c = _step.value;

      var isLast = idx === len - 1;
      switch (c.method) {
        case 'createDatacenter':
          val = val.then(function () {
            return client.create({
              type: 'datacenter',
              folder: folder,
              name: c.name
            });
          });
          break;

        case 'folder':
          folder = c.id;
          break;

        case 'get':
          if (!type) return {
              v: Promise$1.reject(new Error('no type specified'))
            };
          id = c.id;
          resultType = VIM_OBJECT;
          if (isLast) return {
              v: get$1(client, type, id, limit, offset, properties)
            };
          break;

        case 'getAll':
          if (!type) return {
              v: Promise$1.reject(new Error('no type specified'))
            };
          resultType = VIM_COLLECTION;
          break;

        case 'limit':
          limit = c.limit;
          break;

        case 'logout':
          return {
            v: client.logout()
          };

        case 'nth':
          var handleNth = function handleNth(result) {
            if (!_.isArray(result)) throw new Error('cannot get nth on non-array');
            if (result.length - 1 < c.nth) {
              if (c.default === undefined) throw new Error('invalid index');
              return c.default;
            }
            return result[c.nth];
          };

          switch (resultType) {
            case VIM_COLLECTION:
              val = get$1(client, type, id, properties, limit, offset, false).then(handleNth);
              resultType = OBJECT;
              break;
            case COLLECTION:
              val = val.then(handleNth);
              resultType = OBJECT;
              break;
            case ARRAY:
              val = val.then(handleNth);
              resultType = OBJECT;
              break;
            default:
              return {
                v: Promise$1.reject(new Error('cannot get nth on non list types'))
              };
          }
          break;

        case 'offset':
          offset = c.offset;
          break;

        case 'pluck':
          properties = buildPropList(c.args);
          if (!properties.length) return {
              v: Promise$1.reject(new Error('no properties specified'))
            };
          if (resultType === VIM_COLLECTION || resultType === VIM_OBJECT) {
            val = get$1(client, type, id, properties, limit, offset, false);
            resultType = resultType === VIM_COLLECTION ? COLLECTION : OBJECT;
          } else if (resultType === COLLECTION || resultType === OBJECT) {
            if (!(val instanceof Promise$1)) return {
                v: Promise$1.reject(new Error('no selection found'))
              };
            val = val.then(function (v) {
              return pluck(v, properties);
            });
          }
          break;

        case 'retrieve':
          val = client.retrieve(c.args, { maxObjects: limit });
          resultType = VIM_COLLECTION;
          break;

        case 'session':
          val = Promise$1.resolve(q._session);
          resultType = STRING;
          break;

        case 'token':
          if (c.token) client.setSecurity(CookieSecurity$1('vmware_soap_session="' + _this._token + '"'));
          val = Promise$1.resolve(q._token);
          resultType = STRING;
          break;

        default:
          break;
      }
      idx++;
    };

    for (var _iterator = chain[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ret = _loop();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return val;
}

/**
 * Top level vsphere-connect namespace, used to build a request chain
 * @example
 * import VSphere from 'vsphere-connect'
 *
 * let v = VSphere('vsphere.mydomain.com', {
 *   username: 'root',
 *   password: 'password',
 *   ignoreSSL: true
 * })
 *
 * v.type('cluster')
 *   .pluck('name')
 *   .run()
 *   .then(clusters => {
 *     console.log(clusters)
 *     return v.logout().run()
 *   })
 */

var v = function () {
  function v(client) {
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var chain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var prev = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    classCallCheck(this, v);

    this._client = client;
    this._chain = chain;
    this._prev = prev;
    this._type = type;
  }

  /**
   * Resolves a vSphere Connect client instance
   * @returns {Promise.<VSphereConnectClient>}
   */


  createClass(v, [{
    key: 'client',
    value: function client() {
      var _this = this;

      return this._client._connection.then(function () {
        return _this._client;
      });
    }

    /**
     * Creates a new datacenter
     * @param {String} name - datacenter name
     * @returns {v}
     */

  }, {
    key: 'createDatacenter',
    value: function createDatacenter(name) {
      if (!_.isString(name)) throw new Error('no name specified');
      var method = 'createDatacenter';
      this._chain.push({ method: method, prev: this._prev, name: name });
      this._prev = method;
      return this;
    }

    /**
     * Selects a folder
     * @param {String} id - folder id
     * @returns {v}
     */

  }, {
    key: 'folder',
    value: function folder(id) {
      if (!_.isString(id)) throw new Error('no id specified');
      var method = 'folder';
      this._chain.push({ method: method, prev: this._prev, id: id });
      this._prev = method;
      return this;
    }

    /**
     * Get the current selected type by id. A call to the type method must precede a call to this method
     * @param {String} id - type id
     * @returns {v}
     */

  }, {
    key: 'get',
    value: function get$$1(id) {
      if (!_.isString(id)) throw new Error('no id specified');
      var method = 'get';
      this._chain.push({ method: method, prev: this._prev, id: id });
      this._prev = method;
      return this;
    }

    /**
     * Get all objects of the current selected type. A call to the type method must precede a call to this method
     * @returns {v}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      var method = 'getAll';
      this._chain.push({ method: method, prev: this._prev });
      this._prev = method;
      return this;
    }

    /**
     * Limit the number of results returned
     * @param {Number} count - The maximum number of results to return
     * @returns {v}
     */

  }, {
    key: 'limit',
    value: function limit(count) {
      if (!_.isNumber(count)) throw new Error('limit must be an integer');
      var method = 'limit';
      this._chain.push({ method: method, prev: this._prev, limit: Math.floor(count) });
      this._prev = method;
      return this;
    }

    /**
     * Log out of the current session
     * @returns {v}
     */

  }, {
    key: 'logout',
    value: function logout() {
      var method = 'logout';
      this._chain.push({ method: method, prev: this._prev });
      this._prev = method;
      return this;
    }

    /**
     * Select a specific result by index
     * @param {Number} index - Result to select
     * @returns {v}
     */

  }, {
    key: 'nth',
    value: function nth(index) {
      if (!_.isNumber(index)) throw new Error('nth selection must be an integer');
      var method = 'nth';
      this._chain.push({ method: method, prev: this._prev, nth: Math.floor(index) });
      this._prev = method;
      return this;
    }

    /**
     * Select results starting at a specific index
     * @param {Number} index - Index to start selection from
     * @returns {v}
     */

  }, {
    key: 'offset',
    value: function offset(index) {
      if (!_.isNumber(index)) throw new Error('offset must be an integer');
      var method = 'offset';
      this._chain.push({ method: method, prev: this._prev, offset: Math.floor(index) });
      this._prev = method;
      return this;
    }

    /**
     * Plucks out one or more attributes from the result set
     * @param {...String} property
     * @returns {v}
     */

  }, {
    key: 'pluck',
    value: function pluck() {
      var method = 'pluck';
      var args = [].concat(Array.prototype.slice.call(arguments));
      if (!this._type) throw new Error('a type must be selected first');
      if (!args.length) throw new Error('pluck requires one or more fields');
      this._chain.push({ method: method, prev: this._prev, args: args });
      this._prev = method;
      return this;
    }

    /**
     * Retrieves results based on the query document
     * @param {QueryDocument} queryDocument
     * @returns {v}
     */

  }, {
    key: 'retrieve',
    value: function retrieve(queryDocument) {
      var method = 'retrieve';
      this._chain.push({ method: method, prev: this._prev, args: queryDocument });
      this._prev = method;
      return this;
    }

    /**
     * Runs the current request chain
     * @returns {Promise.<*>}
     */

  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      return this._client._connection.then(function () {
        _this2._token = _this2._client._token;
        _this2._session = _this2._client._session;
        return query(_this2);
      });
    }

    /**
     * Gets the current session object
     * @returns {v}
     */

  }, {
    key: 'session',
    value: function session() {
      var method = 'session';
      this._chain.push({ method: method, prev: this._prev });
      this._prev = method;
      return this;
    }

    /**
     * Gets the current session token
     * @returns {v}
     */
    /**
     * Sets the current session token
     * @param {String} token
     * @returns {v}
     */

  }, {
    key: 'token',
    value: function token(_token) {
      var method = 'token';
      this._chain.push({ method: method, prev: this._prev, token: _token });
      this._prev = method;
      return this;
    }

    /**
     * Sets the managed object type in the current request chain
     * @param name
     * @returns {v}
     */

  }, {
    key: 'type',
    value: function type(name) {
      if (!name) throw new Error('type method requires a type name');
      return new v(this._client, null, [], null, name);
    }
  }]);
  return v;
}();

/**
 * @module vsphere-connect
 * @description Build complex vSphere API requests
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 */
var VSphereClient = function (_EventEmitter) {
  inherits(VSphereClient, _EventEmitter);

  function VSphereClient(host, options) {
    var _ret;

    classCallCheck(this, VSphereClient);

    var _this = possibleConstructorReturn(this, (VSphereClient.__proto__ || Object.getPrototypeOf(VSphereClient)).call(this));

    if (!host) throw new Error('No host specified');
    _this._host = host;
    _this._options = _.isObject(options) ? options : {};
    _this._options.cacheKey = _this._options.cacheKey || cacheKey;
    _this._endpoint = 'https://' + _this._host + '/sdk/vimService';
    _this._wsdl = _this._endpoint + '.wsdl';
    var soapEvents = _.isObject(_this._options.soapEvents) ? _this._options.soapEvents : {};

    if (_this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    _this._connection = soap.createClient(_this._wsdl, _this._options).then(function (client) {
      if (_.isFunction(soapEvents.request)) client.on('soap.request', soapEvents.request);
      if (_.isFunction(soapEvents.response)) client.on('soap.response', soapEvents.response);
      if (_.isFunction(soapEvents.error)) client.on('soap.error', soapEvents.error);
      if (_.isFunction(soapEvents.fault)) client.on('soap.fault', soapEvents.fault);

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
      _.forEach(methods, function (fn, name) {
        _this[name] = fn.bind(_this);
      });
      if (options.login !== false) return _this.login(_this._options);
    });

    return _ret = new v(_this), possibleConstructorReturn(_this, _ret);
  }

  createClass(VSphereClient, [{
    key: 'setSecurity',
    value: function setSecurity(securityObject) {
      this._soapClient.setSecurity(securityObject);
    }
  }]);
  return VSphereClient;
}(EventEmitter);

/**
 * Creates a new v instance
 * @param {String} host - vsphere host
 * @param {Object} options
 * @param {String|Function} options.cacheKey
 * @param {Boolean} [options.ignoreSSL=false]
 * @returns {v}
 */
function client$1(host, options) {
  return new VSphereClient(host, options);
}

// add utility functions
client$1.Cache = soap.Cache;
client$1.Utils = Utils;
client$1.Errors = Errors;

module.exports = client$1;
