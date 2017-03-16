'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var EventEmitter = _interopDefault(require('events'));
var soap = _interopDefault(require('soap-connect'));
var Promise$1 = _interopDefault(require('bluebird'));

function get(client, type, id, properties, limit, offset, single) {
  return client.retrieve({ type: type, id: id, properties: properties }, { limit: limit, offset: offset }).then(function (result) {
    return single ? _.get(result, '[0]', null) : result;
  }).catch(Promise$1.reject);
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
    if (_.isString(arg)) {
      props = _.union(props, [arg]);
    } else if (_.isArray(arg)) {
      props = _.union(props, arg);
    } else if (_.isObject(arg)) {
      props = _.union(props, makeDotPath(arg));
    }
  });
  return props;
}

/*
 * cacheKey function to allow re-use of cache on same api version and type
 */
var SI_XML = '<?xml version="1.0"?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body xmlns:vim25="urn:vim25">\n    <vim25:RetrieveServiceContent>\n      <vim25:_this type="ServiceInstance">ServiceInstance</vim25:_this>\n    </vim25:RetrieveServiceContent>\n  </soapenv:Body>\n</soapenv:Envelope>';

function cacheKey(tools, wsdl, done) {
  var request = tools.request,
      xmldom = tools.xmldom;

  var url = wsdl.replace(/.wsdl.*$/, '');
  var headers = { 'Content-Type': 'text/xml', 'Content-Length': SI_XML.length };
  request.post({ headers: headers, url: url, body: SI_XML }, function (err, res, body) {
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
    var o = {};
    var obj = result.obj,
        propSet = result.propSet;

    o.moRef = obj;
    _.forEach(propSet, function (prop) {
      var name = prop.name,
          val = prop.val;

      _.set(o, name, val);
    });
    return o;
  });
}

function errorHandler(err, callback, reject) {
  callback(err);
  return reject(err);
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

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
  if (!typeName) {
    moRefError = new InvalidTypeError(type);
  } else if (!id) {
    moRefError = new ObjectReferenceError();
  }

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
  _.forEach(types[apiVersion], function (v, k) {
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
var CookieSecurity = soap.Security.CookieSecurity;

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
    if (type) return client.retrieve({ type: type });
    return Promise$1.reject(new Error('Invalid query chain'));
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
              v: get(client, type, id, limit, offset, properties)
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
              val = get(client, type, id, properties, limit, offset, false).then(handleNth);
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
            val = get(client, type, id, properties, limit, offset, false);
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
          if (c.token) client.setSecurity(CookieSecurity('vmware_soap_session="' + _this._token + '"'));
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

  // allow direct access to the client


  createClass(v, [{
    key: 'client',
    value: function client() {
      var _this = this;

      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
        return false;
      };

      return this._client._connection.then(function () {
        callback(null, _this._client);
        return _this._client;
      }, function (error) {
        return callback;
      });
    }
  }, {
    key: 'createDatacenter',
    value: function createDatacenter(name) {
      if (!_.isString(name)) throw new Error('no name specified');
      var method = 'createDatacenter';
      this._chain.push({ method: method, prev: this._prev, name: name });
      this._prev = method;
      return this;
    }
  }, {
    key: 'folder',
    value: function folder(id) {
      if (!_.isString(id)) throw new Error('no id specified');
      var method = 'folder';
      this._chain.push({ method: method, prev: this._prev, id: id });
      this._prev = method;
      return this;
    }
  }, {
    key: 'get',
    value: function get(id) {
      if (!_.isString(id)) throw new Error('no id specified');
      var method = 'get';
      this._chain.push({ method: method, prev: this._prev, id: id });
      this._prev = method;
      return this;
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      var method = 'getAll';
      this._chain.push({ method: method, prev: this._prev });
      this._prev = method;
      return this;
    }
  }, {
    key: 'limit',
    value: function limit(val) {
      if (!_.isNumber(val)) throw new Error('limit must be an integer');
      var method = 'limit';
      this._chain.push({ method: method, prev: this._prev, limit: parseInt(val) });
      this._prev = method;
      return this;
    }
  }, {
    key: 'logout',
    value: function logout() {
      var method = 'logout';
      this._chain.push({ method: method, prev: this._prev });
      this._prev = method;
      return this;
    }
  }, {
    key: 'nth',
    value: function nth(idx, def) {
      if (!_.isNumber(idx)) throw new Error('nth selection must be an integer');
      var method = 'nth';
      this._chain.push({ method: method, prev: this._prev, nth: parseInt(idx), default: def });
      this._prev = method;
      return this;
    }
  }, {
    key: 'offset',
    value: function offset(val) {
      if (!_.isNumber(val)) throw new Error('offset must be an integer');
      var method = 'offset';
      this._chain.push({ method: method, prev: this._prev, offset: parseInt(val) });
      this._prev = method;
      return this;
    }
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
  }, {
    key: 'retrieve',
    value: function retrieve(args) {
      var method = 'retrieve';
      this._chain.push({ method: method, prev: this._prev, args: args });
      this._prev = method;
      return this;
    }
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
  }, {
    key: 'session',
    value: function session() {
      var method = 'session';
      this._chain.push({ method: method, prev: this._prev });
      this._prev = method;
      return this;
    }
  }, {
    key: 'token',
    value: function token(tkn) {
      var method = 'token';
      this._chain.push({ method: method, prev: this._prev, token: tkn });
      this._prev = method;
      return this;
    }
  }, {
    key: 'type',
    value: function type(name) {
      if (!name) throw new Error('type method requires a type name');
      return new v(this._client, null, [], null, name);
    }
  }]);
  return v;
}();

function createCluster(args, options, callback) {
  var _this = this;

  return new Promise$1(function (resolve, reject) {
    var folder = args.folder,
        name = args.name,
        spec = args.spec;

    if (!name) return errorHandler(new Error('create datacenter requires name'), callback, reject);
    folder = folder ? { type: 'Folder', value: folder } : _this.serviceContent.rootFolder;
    spec = spec || {};
    return _this.method('CreateClusterEx', { _this: folder, name: name, spec: spec }, function (err, result) {
      if (err) return errorHandler(err, callback, reject);
      return resultHandler(result, callback, resolve);
    });
  });
}

function createDatacenter(args, options, callback) {
  var _this = this;

  return new Promise$1(function (resolve, reject) {
    var folder = args.folder,
        name = args.name;

    if (!name) return errorHandler(new Error('create datacenter requires name'), callback, reject);
    folder = folder ? { type: 'Folder', value: folder } : _this.serviceContent.rootFolder;
    return _this.method('CreateDatacenter', { _this: folder, name: name }, function (err, result) {
      if (err) return errorHandler(err, callback, reject);
      return resultHandler(result, callback, resolve);
    });
  });
}

var ONE_MINUTE_IN_MS = 60000;
var ONE_SECOND_IN_MS = 1000;
var FIRST_INTERVAL = 500;
var ERROR = 'error';
var SUCCESS = 'success';
var TaskMonitor = function () {
  function TaskMonitor(client, taskId) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {
      return null;
    };
    classCallCheck(this, TaskMonitor);

    return new Promise$1(function (resolve, reject) {
      var timeout = options.timeout,
          interval = options.interval;

      _this.start = Date.now();
      _this.client = client;
      _this.taskId = taskId;
      _this.interval = _.isNumber(interval) && interval > ONE_SECOND_IN_MS ? parseInt(interval) : ONE_SECOND_IN_MS;
      _this.timeout = _.isNumber(timeout) && timeout > _this.interval ? parseInt(timeout) : ONE_MINUTE_IN_MS;
      _this.callback = callback;
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
        return _this2.client.retrieve({
          type: 'Task',
          id: _this2.taskId,
          properties: ['info.state', 'info.error', 'info.result', 'info.startTime', 'info.completeTime', 'info.entity', 'info.description']
        }, function (err, result) {
          var task = _.get(result, '[0]');
          if (err) return errorHandler(err, _this2.callback, _this2.reject);
          var state = _.get(task, 'info.state');
          if (!state) return errorHandler(new Error('task ' + _this2.taskId + ' was not found'), _this2.callback, _this2.reject);
          _this2.client.emit('task.state', { id: _this2.taskId, state: state });
          if (state === ERROR) {
            var taskError = new Error({
              task: _this2.taskId,
              info: task
            });
            return errorHandler(taskError, _this2.callback, _this2.reject);
          } else if (state === SUCCESS) {
            return resultHandler(task, _this2.callback, _this2.resolve);
          } else if (Date.now() - _this2.start >= _this2.timeout) {
            var timeoutError = new Error({
              task: _this2.taskId,
              message: 'the task monitor timed out, the task may still complete successfully',
              info: task
            });
            return errorHandler(timeoutError, _this2.callback, _this2.reject);
          } else {
            return _this2.monitor(_this2.interval);
          }
        });
      }, interval);
    }
  }]);
  return TaskMonitor;
}();

function task (client, taskId, options, callback) {
  return new TaskMonitor(client, taskId, options, callback);
}

var monitor = {
  task: task
};

function createDVSwitch(args, options, callback) {
  var _this = this;

  return new Promise$1(function (resolve, reject) {
    if (semver.lt(_this.apiVersion, '4.0')) {
      return errorHandler(new Error('create dvSwitch requires api 4.0 or higher'), callback, reject);
    }
    var folder = args.folder,
        datacenter = args.datacenter,
        spec = args.spec;

    if (!spec) return errorHandler(new Error('create dvSwitch requires a spec'), callback, reject);

    if (folder) {
      folder = Promise$1.resolve({ type: 'Folder', value: folder });
    } else if (datacenter) {
      folder = _this.retrieve({
        type: 'Datacenter',
        id: datacenter,
        properties: ['networkFolder']
      }).then(function (dc) {
        return _.get(dc, 'networkFolder');
      }).catch(function (err) {
        return errorHandler(err, callback, reject);
      });
    } else {
      return errorHandler(new Error('datacenter or folder required to create dvSwitch'), callback, reject);
    }

    return folder.then(function (folderRef) {
      return _this.method('CreateDVS_Task', { _this: folderRef, spec: spec }, function (err, result) {
        if (err) return errorHandler(err, callback, reject);
        if (options.async === false) {
          return monitor.task(_this, _.get(result, 'value'), options, function (err, result) {
            if (err) return errorHandler(err, callback, reject);
            return resultHandler(result, callback, resolve);
          });
        }
        return resultHandler(result, callback, resolve);
      });
    });
  });
}

function createFolder(args, options, callback) {
  var _this = this;

  return new Promise$1(function (resolve, reject) {
    var folder = args.folder,
        name = args.name;

    if (!name) return errorHandler(new Error('create folder requires name'), callback, reject);
    folder = folder ? { type: 'Folder', value: folder } : _this.serviceContent.rootFolder;
    return _this.method('CreateFolder', { _this: folder, name: name }, function (err, result) {
      if (err) return errorHandler(err, callback, reject);
      return resultHandler(result, callback, resolve);
    });
  });
}

function createStoreCluster(args, options, callback) {
  var _this = this;

  return new Promise$1(function (resolve, reject) {
    if (semver.lt(_this.apiVersion, '5.0')) {
      return errorHandler(new Error('create datastore cluster requires api 5.0 or higher'), callback, reject);
    }
    var folder = args.folder,
        name = args.name;

    if (!name) return errorHandler(new Error('create folder requires name'), callback, reject);
    folder = folder ? { type: 'Folder', value: folder } : _this.serviceContent.rootFolder;
    return _this.method('CreateStoragePod', { _this: folder, name: name }, function (err, result) {
      if (err) return errorHandler(err, callback, reject);
      return resultHandler(result, callback, resolve);
    });
  });
}

function createVM(args, options, callback) {
  var _this = this;

  return new Promise$1(function (resolve, reject) {
    var folder = args.folder,
        datacenter = args.datacenter,
        config = args.config,
        pool = args.pool,
        host = args.host;

    if (!config) return errorHandler(new Error('create vm requires a config'), callback, reject);

    if (folder) {
      folder = Promise$1.resolve({ type: 'Folder', value: folder });
    } else if (datacenter) {
      folder = _this.retrieve({
        type: 'Datacenter',
        id: datacenter,
        properties: ['vmFolder']
      }).then(function (dc) {
        return _.get(dc, 'vmFolder');
      }).catch(function (err) {
        return errorHandler(err, callback, reject);
      });
    } else {
      return errorHandler(new Error('datacenter or folder required to create vm'), callback, reject);
    }

    return folder.then(function (folderRef) {
      return _this.method('CreateVM_Task', { _this: folderRef, config: config, pool: pool, host: host }, function (err, result) {
        if (err) return errorHandler(err, callback, reject);
        if (options.async === false) {
          return monitor.task(_this, _.get(result, 'value'), options, function (err, result) {
            if (err) return errorHandler(err, callback, reject);
            return resultHandler(result, callback, resolve);
          });
        }
        return resultHandler(result, callback, resolve);
      });
    });
  });
}

function create() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = arguments[1];
  var callback = arguments[2];

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  callback = _.isFunction(callback) ? callback : function () {
    return false;
  };
  options = options || {};
  var type = args.type || _.get(args, 'moRef.type');
  switch (this.typeResolver(type)) {
    case 'ClusterComputeResource':
      return createCluster.call(this, args, options, callback);
    case 'Datacenter':
      return createDatacenter.call(this, args, options, callback);
    case 'DistributedVirtualSwitch':
      return createDVSwitch.call(this, args, options, callback);
    case 'Folder':
      return createFolder.call(this, args, options, callback);
    case 'StoragePod':
      return createStoreCluster.call(this, args, options, callback);
    case 'VirtualMachine':
      return createVM.call(this, args, options, callback);
    default:
      var err = new Error('invalid type "' + type + '" specified during create');
      callback(err);
      return Promise$1.reject(err);
  }
}

function destroy() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _this = this;

  var options = arguments[1];
  var callback = arguments[2];

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  callback = _.isFunction(callback) ? callback : function () {
    return null;
  };
  options = options || {};

  return new Promise$1(function (resolve, reject) {
    var type = args.type,
        id = args.id,
        moRef = args.moRef;

    var typeName = _this.typeResolver(type);
    var obj = moRef || { type: typeName, value: id };
    if (!moRef && !type && !id) return errorHandler(new Error('no object specified to destroy'), callback, reject);
    return _this.method('Destroy_Task', { _this: obj }, function (err, result) {
      if (err) return errorHandler(err, callback, reject);
      if (options.async === false) {
        return monitor.task(_this, _.get(result, 'value'), options, function (err, result) {
          if (err) return errorHandler(err, callback, reject);
          return resultHandler(result, callback, resolve);
        });
      }
      return resultHandler(result, callback, resolve);
    });
  });
}

var CookieSecurity$1 = soap.Security.CookieSecurity;

function getToken(headers) {
  return _.get(_.get(headers, 'set-cookie[0]', '').match(/"(.*)"/), '[1]', null);
}

function login() {
  var _this = this;

  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return false;
  };
  var username = args.username,
      password = args.password,
      token = args.token;

  var isHostAgent = _.get(this, 'serviceContent.about.apiType') === 'HostAgent';
  return new Promise$1(function (resolve, reject) {
    try {
      if (token) {
        if (isHostAgent) throw new Error('token/cookie authentication is not supposted when connecting to a host, ' + 'please use username/password');
        _this._token = token;
        _this.setSecurity(CookieSecurity$1('vmware_soap_session="' + _this._token + '"'));
        return _this.retrieve({
          type: 'SessionManager',
          id: 'SessionManager',
          properties: ['currentSession']
        }, function (err, sessions) {
          if (err) return errorHandler(err, callback, reject);
          _this._session = _.get(sessions, '[0].currentSession');
          return resultHandler(_this._session, callback, resolve);
        });
      } else if (username && password) {
        return _this.method('Login', {
          _this: _this.serviceContent.sessionManager,
          userName: username,
          password: password
        }, function (err, session) {
          if (err) throw err;
          _this._soapClient.setSecurity(CookieSecurity$1(_this._soapClient.lastResponse.headers));
          _this._token = getToken(_this._soapClient.lastResponse.headers);
          _this._session = session;
          return resultHandler(_this._session, callback, resolve);
        });
      }
      throw new Error('No credentials provided. A username/password or sessionId must be provided to login');
    } catch (err) {
      return errorHandler(err, callback, reject);
    }
  });
}

function logout() {
  var _this = this;

  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
    return false;
  };

  return new Promise$1(function (resolve, reject) {
    return _this.method('Logout', { _this: _this.serviceContent.sessionManager }, function (err) {
      return err ? errorHandler(err, callback, reject) : resultHandler({ logout: true }, callback, resolve);
    });
  });
}

function method(name) {
  var _this = this;

  var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
    return null;
  };

  return new Promise$1(function (resolve, reject) {
    try {
      var fn = _.get(_this._VimPort, '["' + name + '"]');
      if (!_.isFunction(fn)) throw new InvalidMethodError(name);
      fn(args, function (err, result) {
        if (err) return errorHandler(err, callback, reject);
        return resultHandler(_.get(result, 'returnval', result), callback, resolve);
      });
    } catch (err) {
      return errorHandler(err, callback, reject);
    }
  });
}

function getParent(type, id, parentType, root, resolve, reject, callback) {
  var _this = this;

  var match = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;

  this.retrieve({
    type: type,
    id: id,
    properties: ['parent']
  }, function (err, result) {
    if (err) return errorHandler(err, callback, reject);
    var moRef = _.get(result, 'parent');
    var hasParent = !_.isEmpty(moRef);
    var atRoot = _.isEqual(_this.serviceContent.rootFolder, moRef);

    if (!root) {
      if (!parentType || parentType === moRef.type) return resultHandler(moRef, callback, resolve);
      if (parentType && hasParent && parentType !== moRef.type) {
        return getParent.call(_this, moRef.type, moRef.id, parentType, root, resolve, reject, callback, match);
      }
      return resultHandler(match, callback, resolve);
    }

    if (atRoot || !hasParent) return resultHandler(match, callback, resolve);
    return getParent.call(_this, moRef.type, moRef.id, parentType, root, resolve, reject, callback, match);
  });
}

function parent() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _this2 = this;

  var options = arguments[1];
  var callback = arguments[2];

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  callback = _.isFunction(callback) ? callback : function () {
    return null;
  };
  options = options || {};

  return new Promise$1(function (resolve, reject) {
    var root = args.root,
        parent = args.parent;

    var _extractMoRef = extractMoRef(args),
        typeName = _extractMoRef.typeName,
        id = _extractMoRef.id,
        moRefError = _extractMoRef.moRefError;

    var parentType = parent ? _this2.typeResolver(parent) : null;

    if (moRefError) return errorHandler(moRefError, callback, reject);
    if (parent && !parentType) return errorHandler(new InvalidTypeError(parent), callback, reject);

    return getParent.call(_this2, typeName, id, parentType, root, resolve, reject, callback);
  });
}

function reload() {
  var _this = this;

  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return false;
  };

  return new Promise$1(function (resolve, reject) {
    var type = args.type,
        id = args.id,
        moRef = args.moRef;

    var typeName = _this.typeResolver(type);
    var obj = moRef || { type: typeName, value: id };
    if (!moRef && !type && !id) return errorHandler(new Error('no object specified to reload'), callback, reject);
    return _this.method('Reload', { _this: obj }, function (err) {
      return err ? errorHandler(err, callback, reject) : resultHandler({ reload: true }, callback, resolve);
    });
  });
}

function rename() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _this = this;

  var options = arguments[1];
  var callback = arguments[2];

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  callback = _.isFunction(callback) ? callback : function () {
    return null;
  };
  options = options || {};

  return new Promise$1(function (resolve, reject) {
    var type = args.type,
        id = args.id,
        moRef = args.moRef,
        name = args.name;

    var typeName = _this.typeResolver(type);
    var obj = moRef || { type: typeName, value: id };
    if (!moRef && !type && !id) return errorHandler(new Error('no object specified to destroy'), callback, reject);
    if (!_.isString(name)) return errorHandler(new Error('invalid name or name not specified'), callback, reject);
    return _this.method('Rename_Task', { _this: obj, newName: name }, function (err, result) {
      if (err) return errorHandler(err, callback, reject);
      if (options.async === false) {
        return monitor.task(_this, _.get(result, 'value'), options, function (err, result) {
          if (err) return errorHandler(err, callback, reject);
          return resultHandler(result, callback, resolve);
        });
      }
      return resultHandler(result, callback, resolve);
    });
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
    get: function get() {
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

function TraversalSpec$1 (obj) {
  return new TraversalSpec(obj);
}

var SelectionSpec = function () {
  function SelectionSpec(obj) {
    classCallCheck(this, SelectionSpec);

    this.obj = obj;
  }

  createClass(SelectionSpec, [{
    key: 'spec',
    get: function get() {
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

function SelectionSpec$1 (obj) {
  return new SelectionSpec(obj);
}

var ObjectSpec = function () {
  function ObjectSpec(obj) {
    classCallCheck(this, ObjectSpec);

    this.obj = obj;
  }

  createClass(ObjectSpec, [{
    key: 'spec',
    get: function get() {
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

function ObjectSpec$1 (obj) {
  return new ObjectSpec(obj);
}

var PropertySpec = function () {
  function PropertySpec(obj) {
    classCallCheck(this, PropertySpec);

    this.obj = obj;
  }

  createClass(PropertySpec, [{
    key: "spec",
    get: function get() {
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

function PropertySpec$1 (obj) {
  return new PropertySpec(obj);
}

var PropertyFilterSpec = function () {
  function PropertyFilterSpec(obj, client) {
    classCallCheck(this, PropertyFilterSpec);

    this.obj = obj;
    this.client = client;
  }

  createClass(PropertyFilterSpec, [{
    key: 'spec',
    get: function get() {
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

function PropertyFilterSpec$1 (obj, client) {
  return new PropertyFilterSpec(obj, client);
}

function getResults(result, objects, limit, offset, callback) {
  if (!result) {
    callback(null, objects);
    return Promise$1.resolve(objects);
  }
  var objs = _.union(objects, convertRetrievedProperties(result));

  if (result.token && (limit === undefined || objs.length < limit)) {
    return this.method('ContinueRetrievePropertiesEx', {
      _this: this.serviceContent.propertyCollector,
      token: result.token
    }).then(function (results) {
      return getResults.call(this, results, objs, limit, offset, callback);
    }).catch(function (err) {
      callback(err);
      return Promise$1.reject(err);
    });
  } else {
    var results = _.slice(objs, offset || 0, limit || objs.length);
    callback(null, results);
    return Promise$1.resolve(results);
  }
}

function retrieve() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _this = this;

  var options = arguments[1];
  var callback = arguments[2];

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  callback = _.isFunction(callback) ? callback : function () {
    return false;
  };
  options = options || {};

  var limit = options.limit;
  var offset = options.offset || 0;
  if (_.isNumber(offset) && _.isNumber(limit)) limit += offset;

  var retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties';
  var specMap = _.map(graphSpec(args), function (s) {
    return PropertyFilterSpec$1(s, _this).spec;
  });
  return Promise$1.all(specMap).then(function (specSet) {
    return _this.method(retrieveMethod, {
      _this: _this.serviceContent.propertyCollector,
      specSet: specSet,
      options: {}
    }).then(function (result) {
      return getResults.call(_this, result, [], limit, offset, callback);
    }).catch(function (err) {
      callback(err);
      return Promise$1.reject(err);
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

var VSphereClient = function (_EventEmitter) {
  inherits(VSphereClient, _EventEmitter);

  function VSphereClient(host) {
    var _ret;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, VSphereClient);

    var _this = possibleConstructorReturn(this, (VSphereClient.__proto__ || Object.getPrototypeOf(VSphereClient)).call(this));

    if (!host) throw new Error('No host specified');
    _this._host = host;
    _this._options = options;
    _this._options.cacheKey = _this._options.cacheKey || cacheKey;
    _this._endpoint = 'https://' + _this._host + '/sdk/vimService';
    _this._wsdl = _this._endpoint + '.wsdl';
    var soapEvents = _this._options.soapEvents = _this._options.soapEvents || {};

    if (_this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    _this._connection = new Promise$1(function (resolve, reject) {
      return soap.createClient(_this._wsdl, _this._options, function (err, client) {
        if (err) return reject(err);
        if (_.isFunction(soapEvents.request)) client.on('soap.request', soapEvents.request);
        if (_.isFunction(soapEvents.response)) client.on('soap.response', soapEvents.response);
        if (_.isFunction(soapEvents.error)) client.on('soap.error', soapEvents.error);
        if (_.isFunction(soapEvents.fault)) client.on('soap.fault', soapEvents.fault);

        _this._soapClient = client;
        _this._VimPort = _.get(client, 'services.VimService.VimPort');

        // retrieve service content
        return _this._VimPort.RetrieveServiceContent({
          _this: {
            type: 'ServiceInstance',
            value: 'ServiceInstance'
          }
        }, function (err, result) {
          if (err) return reject(err);
          _this.serviceContent = _.get(result, 'returnval');
          _this.apiVersion = _.get(_this.serviceContent, 'about.apiVersion');
          _this.typeResolver = typeResolver(_this.apiVersion);
          _.forEach(methods, function (fn, name) {
            _this[name] = fn.bind(_this);
          });

          if (options.login !== false) {
            return _this.login(_this._options).then(resolve).catch(reject);
          }
          return resolve();
        });
      });
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

// convenience method to create a new client
function client(host) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return new VSphereClient(host, options);
}

// add utility functions
client.Cache = soap.Cache;
client.Utils = Utils;
client.Errors = Errors;

module.exports = client;