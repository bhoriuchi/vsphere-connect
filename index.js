'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var EventEmitter = _interopDefault(require('events'));
var url = _interopDefault(require('url'));
var Promise$1 = _interopDefault(require('bluebird'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var xmldom = _interopDefault(require('xmldom'));
var request = _interopDefault(require('request'));
var LocalStorage = _interopDefault(require('node-localstorage'));
var xmlbuilder = _interopDefault(require('xmlbuilder'));
var semver = _interopDefault(require('semver'));
var Debug = _interopDefault(require('debug'));
var Rx = _interopDefault(require('rxjs'));

var SOAP = {
  'http://schemas.xmlsoap.org/wsdl/soap/': {
    version: '1.1',
    ns: 'http://schemas.xmlsoap.org/wsdl/soap/',
    envelope: 'http://schemas.xmlsoap.org/soap/envelope/',
    encoding: 'http://schemas.xmlsoap.org/soap/encoding/',
    contentType: 'text/xml'
  },
  'http://schemas.xmlsoap.org/wsdl/soap12/': {
    version: '1.2',
    ns: 'http://schemas.xmlsoap.org/wsdl/soap12/',
    encoding: 'http://www.w3.org/2003/05/soap-encoding/',
    envelope: 'http://www.w3.org/2003/05/soap-envelope',
    contentType: 'application/soap+xml'
  }
};

var XS_NS = 'http://www.w3.org/2001/XMLSchema';
var XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance';
var WSDL_NS = 'http://schemas.xmlsoap.org/wsdl/';

var XS_PREFIX = 'xsd';
var XSI_PREFIX = 'xsi';

var SOAPENV_PREFIX = 'soapenv';
var SOAPENC_PREFIX = 'soapenc';


var NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};

var HTTP_RX = /^https?:\/\/.+/i;
var ERROR_STAUTS = { statusCode: 500 };
var OK_STATUS = { statusCode: 200 };

function loadDoc(uri, cache) {
  var _this = this;

  var encoding = _.get(this, 'options.encoding') || 'utf8';

  if (!_.has(cache, uri)) {
    cache[uri] = {};
    var baseURI = uri.substring(0, uri.lastIndexOf('/')) + '/';
    var isHTTP = baseURI.match(HTTP_RX);
    this.emit('wsdl.load.start', uri);

    var load = function load(err, res, body) {
      if (err || res.statusCode !== 200) {
        return _this.emit('wsdl.load.error', err || body || res);
      }
      var address = '';
      var doc = cache[uri] = new xmldom.DOMParser().parseFromString(body);
      var wsdlImports = doc.getElementsByTagNameNS(WSDL_NS, 'import');
      var xsImports = doc.getElementsByTagNameNS(XS_NS, 'import');
      var xsIncludes = doc.getElementsByTagNameNS(XS_NS, 'include');
      _.forEach(_.union(wsdlImports, xsImports, xsIncludes), function (link) {
        var loc = link.getAttribute('location') || link.getAttribute('schemaLocation');
        if (isHTTP) {
          address = url.parse(loc).host ? loc : url.resolve(baseURI, loc);
        } else {
          address = path.resolve(baseURI, loc);
        }
        _this.loadDoc(address, cache);
      });
      _this.emit('wsdl.load.end', uri);
    };

    if (isHTTP) {
      return request(uri, function (err, res, body) {
        return load(err, res, body);
      });
    }

    // is a file
    try {
      return fs.readFile(uri, encoding, function (err, body) {
        if (err) return load(err, ERROR_STAUTS, body);
        return load(null, OK_STATUS, body);
      });
    } catch (err) {
      return load(err, ERROR_STAUTS, '');
    }
  }
}

var any = function any(obj) {
  return obj;
};
var toDate = function toDate(obj) {
  try {
    return new Date(obj);
  } catch (err) {
    return obj;
  }
};

var xsd10 = {
  anyType: { convert: any },
  anySimpleType: { convert: any },
  duration: { convert: String },
  dateTime: { convert: toDate },
  time: { convert: String },
  date: { convert: toDate },
  gYearMonth: { convert: String },
  gYear: { convert: String },
  gMonthDay: { convert: String },
  gDay: { convert: String },
  gMonth: { convert: String },
  boolean: { convert: Boolean },
  base64Binary: { convert: String },
  hexBinary: { convert: String },
  float: { convert: Number },
  double: { convert: Number },
  anyURI: { convert: String },
  QName: { convert: String },
  NOTATION: { convert: String },
  string: { convert: String },
  decimal: { convert: Number },
  normalizedString: { convert: String },
  integer: { convert: Number },
  token: { convert: String },
  nonPositiveInteger: { convert: Number },
  long: { convert: Number },
  nonNegativeInteger: { convert: Number },
  language: { convert: String },
  Name: { convert: String },
  NMTOKEN: { convert: String },
  negativeInteger: { convert: Number },
  int: { convert: Number },
  unsignedLong: { convert: Number },
  positiveInteger: { convert: Number },
  NCName: { convert: String },
  NMTOKENS: { convert: String },
  short: { convert: Number },
  unsignedInt: { convert: Number },
  ID: { convert: String },
  IDREF: { convert: String },
  ENTITY: { convert: String },
  byte: { convert: String },
  unsignedShort: { convert: Number },
  IDREFS: { convert: String },
  ENTITIES: { convert: String },
  unsignedByte: { convert: String }
};

var NAMESPACES = {
  'http://www.w3.org/2001/XMLSchema': xsd10
};

function getBuiltinNSMeta() {
  return _.map(NAMESPACES, function (ns, name) {
    return {
      name: name,
      operations: [],
      services: [],
      types: _.keys(ns)
    };
  });
}

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request$$1 = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request$$1;
        } else {
          front = back = request$$1;
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





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};



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

var ELEMENT_NODE = NODE_TYPES.ELEMENT_NODE;


function getQName(qname) {
  var _ref, _ref2;

  var pfx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var _qname$split = qname.split(':'),
      _qname$split2 = slicedToArray(_qname$split, 2),
      prefix = _qname$split2[0],
      localName = _qname$split2[1];

  return localName ? (_ref = {}, babelHelpers.defineProperty(_ref, pfx + 'prefix', prefix), babelHelpers.defineProperty(_ref, pfx + 'localName', localName), _ref) : (_ref2 = {}, babelHelpers.defineProperty(_ref2, pfx + 'prefix', ''), babelHelpers.defineProperty(_ref2, pfx + 'localName', prefix), _ref2);
}

function firstNode(nodes) {
  return _.get(nodes, '0');
}

function filterEmpty(obj) {
  return _.omitBy(obj, function (val) {
    if (_.isArray(val) && !val.length) return true;
    if (!val && val !== false) return true;
  });
}

function getOperationElement(data, node) {
  var _getQName = getQName(node.getAttribute('message'), 'm_'),
      mPrefix = _getQName.mPrefix,
      mLocalName = _getQName.mLocalName;

  var msgNS = node.lookupNamespaceURI(mPrefix);
  var msg = _.get(data, '["' + msgNS + '"].messages["' + mLocalName + '"]');
  var part = _.first(msg.getElementsByTagNameNS(WSDL_NS, 'part'));

  var _getQName2 = getQName(part.getAttribute('element'), 'e_'),
      ePrefix = _getQName2.ePrefix,
      eLocalName = _getQName2.eLocalName;

  var elNS = node.lookupNamespaceURI(ePrefix);
  var el = _.get(data, '["' + elNS + '"].elements["' + eLocalName + '"]');
  return el;
}

function parseRef(namespaces, node, ref) {
  var _getQName3 = getQName(ref),
      prefix = _getQName3.prefix,
      localName = _getQName3.localName;

  var namespace = prefix ? node.lookupNamespaceURI(prefix) : node.namespaceURI || XS_NS;
  var nsIdx = _.findIndex(namespaces, { name: namespace });
  var typeIdx = namespaces[nsIdx].types.indexOf(localName);

  // if not found, look through other namespaces
  if (typeIdx === -1) {
    _.forEach(namespaces, function (n, idx) {
      typeIdx = n.types.indexOf(localName);
      if (typeIdx !== -1) {
        nsIdx = idx;
        return false;
      }
    });
  }
  return [nsIdx, typeIdx];
}

function toProperty(namespaces, node, data) {
  var obj = {};
  _.forEach(node.attributes, function (attr) {
    var name = attr.name;
    var value = attr.value;
    if (name === 'ref') {
      var _getQName4 = getQName(value),
          prefix = _getQName4.prefix,
          localName = _getQName4.localName;

      var elNSURI = node.lookupNamespaceURI(prefix);
      var ref = _.get(data, '["' + elNSURI + '"].elements["' + localName + '"]');
      if (ref) {
        obj.name = ref.getAttribute('name');
        obj.type = parseRef(namespaces, ref, ref.getAttribute('type'));
      }
    } else if (name === 'type') {
      obj.type = parseRef(namespaces, node, value);
    } else {
      obj[name] = value;
    }
  });
  return obj;
}

function getNodeData(node) {
  return _.get(node, 'firstChild.data') || _.get(node, 'firstChild.nodeValue');
}

function getEndpointFromPort(client, port) {
  var svcURL = url.parse(port.address);
  if (svcURL.host.match(/localhost/i)) svcURL.host = client.options.endpoint;
  return url.format(svcURL);
}

function getFirstChildElement(node) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(node.childNodes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var n = node.childNodes[key];
      if (n.nodeType === ELEMENT_NODE) {
        return n;
      }
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
}

function getTypes(data, namespaces, types) {
  return _.map(types, function (type) {
    var maxOccurs = null;
    var minOccurs = null;
    var base = void 0;
    var attributes = [];
    var elements = [];
    var enumerations = [];
    var unions = [];

    _.forEach(type.childNodes, function (node) {
      switch (node.localName) {
        case 'sequence':
        case 'choice':
        case 'all':
          maxOccurs = node.getAttribute('maxOccurs') || maxOccurs;
          minOccurs = node.getAttribute('minOccurs') || minOccurs;
      }
    });

    // process XSD elements
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'element'), function (node) {
      var el = toProperty(namespaces, node, data);
      if (node.parentNode.localName === 'choice') {
        el.minOccurs = '0';
        maxOccurs = node.parentNode.getAttribute('maxOccurs') || maxOccurs;
      }
      elements.push(el);
    });

    // process XSD anys
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'any'), function (node) {
      elements.push(toProperty(namespaces, node, data));
    });

    // process attributes
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'attribute'), function (node) {
      attributes.push(toProperty(namespaces, node, data));
    });

    // process anyAttributes
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'anyAttribute'), function (node) {
      attributes.push(toProperty(namespaces, node, data));
    });

    // process attributeGroup
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'attributeGroup'), function (node) {
      var _getQName = getQName(node.getAttribute('ref')),
          prefix = _getQName.prefix,
          localName = _getQName.localName;

      var groupNSURI = node.lookupNamespaceURI(prefix);
      var attrGroup = _.get(data, '["' + groupNSURI + '"].attributeGroups', localName);
      _.forEach(attrGroup.getElementsByTagNameNS(XS_NS, 'attribute'), function (_node) {
        attributes.push(toProperty(namespaces, _node, data));
      });
      _.forEach(attrGroup.getElementsByTagNameNS(XS_NS, 'anyAttribute'), function (_node) {
        attributes.push(toProperty(namespaces, _node, data));
      });
    });

    // process extension
    var extension = _.get(type.getElementsByTagNameNS(XS_NS, 'extension'), '[0]', {});
    if (_.isFunction(extension.getAttribute)) {
      base = parseRef(namespaces, extension, extension.getAttribute('base'));
    }

    // process enums
    if (type.localName === 'simpleType') {
      _.forEach(type.getElementsByTagNameNS(XS_NS, 'restriction'), function (node) {
        _.forEach(node.getElementsByTagNameNS(XS_NS, 'enumeration'), function (e) {
          enumerations.push(e.getAttribute('value'));
        });
      });
      _.forEach(type.getElementsByTagNameNS(XS_NS, 'union'), function (node) {
        _.forEach(type.getElementsByTagNameNS(XS_NS, 'memberTypes').split(/\s+/g), function (t) {
          unions.push(parseRef(namespaces, node, t));
        });
      });
    }
    return filterEmpty({
      attributes: attributes,
      base: base,
      elements: elements,
      enumerations: enumerations,
      maxOccurs: maxOccurs,
      minOccurs: minOccurs,
      unions: unions
    });
  });
}

function getPortOperations(data, namespace, port) {
  var _getQName2 = getQName(port.getAttribute('binding')),
      prefix = _getQName2.prefix;

  var bindingNS = prefix ? port.lookupNamespaceURI(prefix) : namespace;
  var binding = _.get(data, '["' + bindingNS + '"].binding');
  if (!binding) return [];
  return _.map(binding.getElementsByTagNameNS(binding.namespaceURI, 'operation'), function (op) {
    return op.getAttribute('name');
  });
}

function getPorts(data, namespace, def) {
  return _.map(def.ports, function (port, name) {
    return {
      name: name,
      address: port.$address,
      soapVersion: port.$soapVersion,
      service: port.parentNode.getAttribute('name'),
      operations: getPortOperations(data, namespace, port)
    };
  });
}

function processDef(data) {
  var operations = [];
  var services = [];
  var types = [];
  var namespaces = getBuiltinNSMeta();

  // add empty array objects for each builtin type
  // to keep indexes in sync
  _.forEach(namespaces, function (ns) {
    ns.isBuiltIn = true;
    operations.push([]);
    services.push([]);
    types.push([]);
  });

  // get types and operations by namespace
  _.forEach(data, function (def, name) {
    namespaces.push({
      name: name,
      prefix: def.$prefix,
      ports: getPorts(data, name, def),
      services: [],
      types: _.keys(def.types)
    });
  });

  // add types
  _.forEach(data, function (def) {
    return types.push(getTypes(data, namespaces, def.types));
  });

  // add operations
  _.forEach(data, function (def) {
    var ops = [];
    if (_.keys(def.ports).length) {
      _.forEach(def.ports, function (port) {
        var pOps = [];

        var _getQName3 = getQName(port.getAttribute('binding')),
            prefix = _getQName3.prefix;

        var portNS = port.lookupNamespaceURI(prefix);
        var binding = _.get(data, '["' + portNS + '"].binding');
        var portOps = _.map(binding.getElementsByTagNameNS(binding.namespaceURI, 'operation'), function (op) {
          return op.getAttribute('name');
        });
        _.forEach(portOps, function (name) {
          var node = _.get(data, '["' + portNS + '"].operations["' + name + '"]');
          var input = getOperationElement(data, _.first(node.getElementsByTagNameNS(WSDL_NS, 'input')));
          var output = getOperationElement(data, _.first(node.getElementsByTagNameNS(WSDL_NS, 'output')));
          pOps.push([{
            action: _.get(data, '["' + portNS + '"].actions["' + name + '"]').getAttribute('soapAction'),
            name: input.getAttribute('name'),
            type: parseRef(namespaces, input, input.getAttribute('type'))
          }, {
            type: parseRef(namespaces, output, output.getAttribute('type'))
          }]);
        });
        ops.push(pOps);
      });
    }
    operations.push(ops);
  });
  return { namespaces: namespaces, operations: operations, services: services, types: types };
}

// set operations via interface or portType
function setOperations(operations, portType) {
  _.forEach(portType.childNodes, function (node) {
    if (node.localName === 'operation') {
      operations[node.getAttribute('name')] = node;
    }
  });
}

function processDoc(doc, data) {
  /*
   * PROCESS DEFINITIONS
   */
  var definitions = doc.getElementsByTagNameNS(WSDL_NS, 'definitions');
  _.forEach(definitions, function (defNode) {
    var ns = defNode.getAttribute('targetNamespace');
    var nsData = data[ns] = data[ns] || {};
    nsData.$prefix = _.findKey(defNode._nsMap, function (o) {
      return o === ns;
    });
    nsData.actions = nsData.actions || {};
    nsData.messages = nsData.messages || {};
    nsData.operations = nsData.operations || {};
    nsData.ports = nsData.ports || {};

    _.forEach(defNode.childNodes, function (childNode) {
      switch (childNode.localName) {
        case 'binding':
          nsData.binding = childNode;
          _.forEach(childNode.childNodes, function (bindingNode) {
            if (bindingNode.localName === 'operation') {
              var op = bindingNode.getAttribute('name');
              _.forEach(bindingNode.childNodes, function (node) {
                if (node.localName === 'operation') nsData.actions[op] = node;
              });
            }
          });
          break;
        case 'message':
          nsData.messages[childNode.getAttribute('name')] = childNode;
          break;
        case 'portType':
          setOperations(nsData.operations, childNode);
          break;
        case 'interface':
          setOperations(nsData.operations, childNode);
          break;
        case 'service':
          _.forEach(childNode.childNodes, function (node) {
            if (node.localName === 'port') {
              nsData.ports[node.getAttribute('name')] = node;
              _.forEach(node.childNodes, function (child) {
                if (child.localName === 'address') {
                  var _getQName = getQName(child.tagName || child.nodeName),
                      prefix = _getQName.prefix;

                  var soapNS = child.lookupNamespaceURI(prefix);
                  if (_.includes(_.keys(SOAP), soapNS)) {
                    node.$address = child.getAttribute('location');
                    node.$soapVersion = _.get(SOAP, '["' + soapNS + '"].version', '1.1');
                  }
                }
              });
            }
          });
          break;
      }
    });
  });

  /*
   * PROCESS SCHEMAS
   */
  var schemas = doc.getElementsByTagNameNS(XS_NS, 'schema');
  _.forEach(schemas, function (schemaNode) {
    var ns = schemaNode.getAttribute('targetNamespace');
    var nsData = data[ns] = data[ns] || {};
    nsData.attributes = nsData.attributes || {};
    nsData.types = nsData.types || {};
    nsData.elements = nsData.elements || {};
    nsData.attributeGroups = nsData.attributeGroups || {};

    _.forEach(schemaNode.childNodes, function (childNode) {
      switch (childNode.localName) {
        case 'attribute':
          nsData.attributes[childNode.getAttribute('name')] = childNode;
          break;
        case 'complexType':
        case 'simpleType':
          nsData.types[childNode.getAttribute('name')] = childNode;
          break;
        case 'element':
          var name = childNode.getAttribute('name');
          var el = nsData.elements[name] = childNode;
          _.forEach(childNode.childNodes, function (node) {
            if (_.includes(['complexType', 'simpleType'], node.localName)) {
              node.setAttribute('name', name);
              el.setAttribute('type', node.lookupPrefix(ns) + ':' + name);
              nsData.types[name] = node;
            }
          });
          break;
        case 'attributeGroup':
          nsData.attributeGroups[childNode.getAttribute('name')] = childNode;
          break;
      }
    });
  });
}

function processDocs(cache, data) {
  _.forEach(cache, function (doc) {
    return processDoc(doc, data);
  });
}

var methods = {
  loadDoc: loadDoc,
  processDef: processDef,
  processDocs: processDocs
};

var BASE_DIR = __dirname.replace(/^(.*\/soap-connect)(.*)$/, '$1');
var STORAGE_PATH = path.resolve(BASE_DIR + '/.localStorage');
var store = new LocalStorage.LocalStorage(STORAGE_PATH);

function set$1(k, value) {
  return store.setItem(k, value);
}

function get$1(k) {
  return store.getItem(k);
}

function length() {
  return store.length;
}

function remove(k) {
  return store.removeItem(k);
}

function key(n) {
  return store.key(n);
}

function clear() {
  return store.clear();
}

var Store = {
  STORAGE_PATH: STORAGE_PATH,
  store: store,
  set: set$1,
  get: get$1,
  length: length,
  remove: remove,
  key: key,
  clear: clear
};

/*
 * Strategy adapted from vSphere JS SDK
 * https://labs.vmware.com/flings/vsphere-sdk-for-javascript#summary
 */

var WSDL = function (_EventEmitter) {
  inherits(WSDL, _EventEmitter);

  function WSDL(address) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _ret;

    var cacheKey = arguments[2];
    classCallCheck(this, WSDL);

    var _this = possibleConstructorReturn(this, (WSDL.__proto__ || Object.getPrototypeOf(WSDL)).call(this));

    _this.cacheKey = cacheKey || address;
    _this.address = address;
    _this.options = options;
    var data = {};

    _.forEach(methods, function (method, name) {
      _this[name] = method.bind(_this);
    });

    return _ret = new Promise(function (resolve, reject) {
      var resolving = [];
      var cache = {};
      var useCache = _.get(_this.options, 'cache', true);

      if (useCache) {
        var rawMetadata = Store.get(_this.cacheKey);
        if (rawMetadata) {
          _this.metadata = JSON.parse(rawMetadata);
          return resolve(_this);
        }
      }

      _this.on('wsdl.load.error', reject);
      _this.on('wsdl.load.start', function (doc) {
        return resolving.push(doc);
      });
      _this.on('wsdl.load.end', function (doc) {
        var idx = resolving.indexOf(doc);
        if (idx >= 0) resolving.splice(idx, 1);
        if (!resolving.length) {
          _this.removeAllListeners();

          // process wsdl
          _this.processDocs(cache, data);
          _this.metadata = _this.processDef(data);

          // store the metadata
          if (useCache) Store.set(_this.cacheKey, JSON.stringify(_this.metadata));

          // resolve the WSDL object
          return resolve(_this);
        }
      });
      _this.loadDoc(_this.address, cache);
    }), babelHelpers.possibleConstructorReturn(_this, _ret);
  }

  createClass(WSDL, [{
    key: 'getType',
    value: function getType(t) {
      var _t = slicedToArray(t, 2),
          ns = _t[0],
          type = _t[1];

      return _.get(this.metadata, 'types[' + ns + '][' + type + ']');
    }
  }, {
    key: 'getTypeByLocalNSPrefix',
    value: function getTypeByLocalNSPrefix(nsPrefix, localName) {
      var nsIdx = _.findIndex(this.metadata.namespaces, { prefix: nsPrefix });
      var ns = _.get(this.metadata.namespaces, '[' + nsIdx + ']');
      var typeIdx = ns.types.indexOf(localName);
      return [nsIdx, typeIdx];
    }
  }, {
    key: 'getTypeByLocalNS',
    value: function getTypeByLocalNS(nsURI, localName) {
      var nsIdx = _.findIndex(this.metadata.namespaces, { name: nsURI });
      var ns = _.get(this.metadata.namespaces, '[' + nsIdx + ']');
      var typeIdx = ns.types.indexOf(localName);
      return [nsIdx, typeIdx];
    }
  }, {
    key: 'getTypeAttribute',
    value: function getTypeAttribute(node) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(node.attributes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key$$1 = _step.value;

          var n = node.attributes[key$$1];
          if (n.localName === 'type') {
            return n;
          }
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
    }
  }, {
    key: 'getOp',
    value: function getOp(o) {
      var _o = slicedToArray(o, 3),
          ns = _o[0],
          port = _o[1],
          op = _o[2];

      return _.get(this.metadata, 'operations[' + ns + '][' + port + '][' + op + ']');
    }
  }, {
    key: 'getTypeName',
    value: function getTypeName(t) {
      var _t2 = slicedToArray(t, 2),
          ns = _t2[0],
          type = _t2[1];

      return _.get(this.metadata, 'namespaces[' + ns + '].types[' + type + ']');
    }
  }, {
    key: 'getTypeRoot',
    value: function getTypeRoot(t) {
      var root = this.getType(t).base;
      return root ? this.getTypeRoot(root) : t;
    }
  }, {
    key: 'getNSPrefix',
    value: function getNSPrefix(t) {
      var _t3 = slicedToArray(t, 1),
          ns = _t3[0];

      return _.get(this.metadata, 'namespaces[' + ns + '].prefix');
    }
  }, {
    key: 'getNSURIByPrefix',
    value: function getNSURIByPrefix(prefix) {
      return _.get(_.find(this.metadata.namespaces, { prefix: prefix }), 'name');
    }
  }, {
    key: 'getTypeByQName',
    value: function getTypeByQName(qname, fallbackNSURI) {
      var _getQName = getQName(qname),
          prefix = _getQName.prefix,
          localName = _getQName.localName;

      var nsURI = prefix ? this.getNSURIByPrefix(prefix) : fallbackNSURI;
      return this.getTypeByLocalNS(nsURI, localName);
    }
  }, {
    key: 'isBuiltInType',
    value: function isBuiltInType(t) {
      var _t4 = slicedToArray(t, 1),
          ns = _t4[0];

      return _.get(this.metadata, 'namespaces[' + ns + '].isBuiltIn') === true;
    }
  }, {
    key: 'isEnumType',
    value: function isEnumType(t) {
      return _.has(this.getType(t), 'enumerations');
    }
  }, {
    key: 'isSimpleType',
    value: function isSimpleType(t) {
      return this.isBuiltInType(t) || this.isEnumType(t);
    }
  }, {
    key: 'isMany',
    value: function isMany(typeDef) {
      if (!typeDef.maxOccurs) return false;
      var maxOccurs = typeDef.maxOccurs === 'unbounded' ? 2 : Number(maxOccurs);
      return maxOccurs > 1;
    }
  }, {
    key: 'isRequired',
    value: function isRequired(typeDef) {
      return Number(typeDef.minOccurs) > 0;
    }
  }, {
    key: 'convertValue',
    value: function convertValue(type, value) {
      if (this.isEnumType(type)) return value;
      var t = this.getType(type);
      return t.convert ? t.convert(value) : value;
    }
  }]);
  return WSDL;
}(EventEmitter);

var WSDL$1 = function (address) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var cacheKey = arguments[2];

  return new WSDL(address, options, cacheKey);
};

// Strategy taken from node-soap/strong-soap

var Security$1 = function () {
  function Security() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Security);

    this.options = options;
  }

  createClass(Security, [{
    key: 'addOptions',
    value: function addOptions(options) {
      _.merge(this.options, options);
    }
  }, {
    key: 'addHttpHeaders',
    value: function addHttpHeaders(headers) {
      _.noop(headers);
    }
  }, {
    key: 'addSoapHeaders',
    value: function addSoapHeaders(headerElement) {
      _.noop(headerElement);
    }
  }, {
    key: 'postProcess',
    value: function postProcess(envelopeElement, headerElement, bodyElement) {
      _.noop(envelopeElement, headerElement, bodyElement);
    }
  }]);
  return Security;
}();

var BasicSecurity = function (_Security) {
  inherits(BasicSecurity, _Security);

  function BasicSecurity(username, password, options) {
    classCallCheck(this, BasicSecurity);

    var _this = possibleConstructorReturn(this, (BasicSecurity.__proto__ || Object.getPrototypeOf(BasicSecurity)).call(this, options));

    _this.credential = new Buffer(username + ':' + password).toString('base64');
    return _this;
  }

  createClass(BasicSecurity, [{
    key: 'addHttpHeaders',
    value: function addHttpHeaders(headers) {
      headers.Authorization = 'Basic ' + this.credential;
    }
  }]);
  return BasicSecurity;
}(Security$1);

var BasicSecurity$1 = function (username, password, options) {
  return new BasicSecurity(username, password, options);
};

var BearerSecurity = function (_Security) {
  inherits(BearerSecurity, _Security);

  function BearerSecurity(token, options) {
    classCallCheck(this, BearerSecurity);

    var _this = possibleConstructorReturn(this, (BearerSecurity.__proto__ || Object.getPrototypeOf(BearerSecurity)).call(this, options));

    _this.token = token;
    return _this;
  }

  createClass(BearerSecurity, [{
    key: 'addHttpHeaders',
    value: function addHttpHeaders(headers) {
      headers.Authorization = 'Bearer ' + this.token;
    }
  }]);
  return BearerSecurity;
}(Security$1);

var BearerSecurity$1 = function (token, options) {
  return new BearerSecurity(token, options);
};

var CookieSecurity = function (_Security) {
  inherits(CookieSecurity, _Security);

  function CookieSecurity(cookie, options) {
    classCallCheck(this, CookieSecurity);

    var _this = possibleConstructorReturn(this, (CookieSecurity.__proto__ || Object.getPrototypeOf(CookieSecurity)).call(this, options));

    var _cookie = _.get(cookie, 'set-cookie', cookie);
    var cookies = _.map(_.castArray(_cookie), function (c) {
      return c.split(';')[0];
    });

    _this.cookie = cookies.join('; ');
    return _this;
  }

  createClass(CookieSecurity, [{
    key: 'addHttpHeaders',
    value: function addHttpHeaders(headers) {
      headers.Cookie = this.cookie;
    }
  }]);
  return CookieSecurity;
}(Security$1);

var CookieSecurity$1 = function (cookie, options) {
  return new CookieSecurity(cookie, options);
};

var Security = {
  Security: Security$1,
  BasicSecurity: BasicSecurity$1,
  BearerSecurity: BearerSecurity$1,
  CookieSecurity: CookieSecurity$1
};

function createTypes(wsdl) {
  var types = {};
  var nsCount = 1;

  // add convert functions to builtins
  var nsIdx = 0;
  _.forEach(NAMESPACES, function (ns) {
    var typeIdx = 0;
    _.forEach(ns, function (type) {
      wsdl.metadata.types[nsIdx][typeIdx] = _.cloneDeep(type);
      typeIdx++;
    });
    nsIdx++;
  });

  // add extendedBy to keep track of inheritance
  _.forEach(wsdl.metadata.types, function (namespace, _nsIdx) {
    _.forEach(namespace, function (type, typeIdx) {
      if (type.base) {
        var t = wsdl.getType(type.base);
        if (t) {
          t.extendedBy = t.extendedBy || [];
          t.extendedBy.push([_nsIdx, typeIdx]);
        }
      }
    });
  });

  _.forEach(wsdl.metadata.namespaces, function (namespace, _nsIdx) {
    var prefix = 'ns' + nsCount;
    if (namespace.prefix) {
      prefix = namespace.prefix;
    } else if (namespace.name === XS_NS) {
      wsdl.metadata.namespaces[_nsIdx].prefix = XS_PREFIX;
      prefix = XS_PREFIX;
    } else {
      wsdl.metadata.namespaces[_nsIdx].prefix = prefix;
      nsCount++;
    }
    _.forEach(namespace.types, function (typeName, typeIdx) {
      _.set(types, '["' + prefix + '"]["' + typeName + '"]', function (data) {
        // TODO: implement this
        _.noop(data, typeIdx);
      });
    });
  });
  return types;
}

function getExtProps(wsdl, type) {
  var ext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  _.forEach(type.extendedBy, function (extType) {
    var name = wsdl.getTypeName(extType);
    var typeInfo = wsdl.getType(extType);
    if (!_.has(ext, '["' + name + '"]')) {
      ext[name] = {
        type: extType,
        props: _.union(_.map(typeInfo.elements, 'name'), _.map(typeInfo.attributes, 'name'))
      };
      getExtProps(wsdl, typeInfo, ext);
    }
  });
  return ext;
}

function typeMatch(wsdl, type, data) {
  // check for an explicitly defined type and return
  // it if found and remove it from the object
  var explicitType = _.get(data, '["@' + XSI_PREFIX + ':type"]');
  if (_.isString(explicitType) && explicitType.indexOf(':') !== -1) {
    delete data['@' + XSI_PREFIX + ':type']; // remove from the object

    var _explicitType$split = explicitType.split(':'),
        _explicitType$split2 = slicedToArray(_explicitType$split, 2),
        nsPrefix = _explicitType$split2[0],
        localName = _explicitType$split2[1];

    return wsdl.getTypeByLocalNSPrefix(nsPrefix, localName);
  }

  // otherwise look for the best match
  var bestMatch = type;
  var info = wsdl.getType(type);
  var props = _.union(_.map(info.elements, 'name'), _.map(info.attributes, 'name'));
  var dataKeys = _.keys(data);
  var inter = _.intersection(props, dataKeys).length;
  if (inter === dataKeys.length) return bestMatch;
  var ext = getExtProps(wsdl, info);

  _.forEach(ext, function (e) {
    var currentInter = _.intersection(e.props, dataKeys).length;
    if (currentInter > inter) {
      inter = currentInter;
      bestMatch = e.type;
    }
  });

  return bestMatch;
}

function serialize(wsdl, typeCoord, data) {
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var parentType = context.parentType,
      _nsUsed = context.nsUsed;

  var obj = {};
  var prefix = wsdl.getNSPrefix(typeCoord);
  var type = wsdl.getType(typeCoord);
  var base = type.base;
  var nsUsed = _nsUsed ? _.union(_nsUsed, [prefix]) : [prefix];

  if (base) {
    obj = !wsdl.isBuiltInType(base) ? serialize(wsdl, base, data, context).obj : { '#text': data.value };
  }

  // set element values
  _.forEach(type.elements, function (el) {
    if (el.name && el.type) {
      var val = _.get(data, '["' + el.name + '"]');
      if (val !== undefined) {
        if (wsdl.isMany(el)) {
          if (_.isArray(val)) {
            obj[prefix + ':' + el.name] = _.map(val, function (v) {
              var t = typeMatch(wsdl, el.type, v);
              var typeName = wsdl.getTypeName(t);
              var typePrefix = wsdl.getNSPrefix(t);
              var isSimple = wsdl.isSimpleType(t);

              return isSimple ? wsdl.convertValue(t, v) : serialize(wsdl, t, v, {
                parentType: [typePrefix, typeName].join(':'),
                nsUsed: nsUsed
              }).obj;
            });
          }
        } else {
          var t = typeMatch(wsdl, el.type, val);
          var typeName = wsdl.getTypeName(t);
          var typePrefix = wsdl.getNSPrefix(t);
          var isSimple = wsdl.isSimpleType(t);

          obj[prefix + ':' + el.name] = isSimple ? wsdl.convertValue(t, val) : serialize(wsdl, t, val, {
            parentType: [typePrefix, typeName].join(':'),
            nsUsed: nsUsed
          }).obj;
        }
      }
    }
  });

  // set attributes
  _.forEach(type.attributes, function (attr) {
    if (attr.name) {
      var val = _.get(data, '["' + attr.name + '"]');
      if (val !== undefined) {
        if (attr.type && wsdl.isSimpleType(attr.type)) {
          val = wsdl.convertValue(attr.type, val);
        }
        obj['@' + attr.name] = val;
      }
    }
  });
  if (!obj['@' + XSI_PREFIX + ':type'] && parentType) {
    obj['@' + XSI_PREFIX + ':type'] = parentType;
  }
  return { obj: obj, nsUsed: nsUsed };
}

function deserialize(wsdl, type, node) {
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (!node.textContent) return undefined;
  var xsiPrefix = context.xsiPrefix,
      ignoreXSI = context.ignoreXSI;

  var xsiType = node.getAttribute(xsiPrefix + ':type');
  var _type = xsiType && !ignoreXSI ? wsdl.getTypeByQName(xsiType, node.namespaceURI) : type;

  var typeDef = wsdl.getType(_type);
  var typeIsMany = wsdl.isMany(typeDef);
  var obj = typeIsMany ? [] : {};

  if (typeDef.base) {
    if (wsdl.isBuiltInType(typeDef.base)) {
      obj = { value: wsdl.convertValue(typeDef.base, node.textContent) };
    } else {
      obj = deserialize(wsdl, typeDef.base, node, _.merge(context, { ignoreXSI: true }));
    }
  }

  if (wsdl.isSimpleType(_type)) {
    return wsdl.convertValue(_type, node.textContent);
  }
  _.forEach(typeDef.elements, function (el) {
    var isMany = wsdl.isMany(el) || typeIsMany;
    if (isMany && !typeIsMany && el.name) obj[el.name] = [];

    _.forEach(node.childNodes, function (childNode) {
      if (childNode.localName === el.name) {
        var o = deserialize(wsdl, el.type, childNode, _.merge(context, { ignoreXSI: false }));
        if (o !== undefined) {
          if (isMany) {
            if (typeIsMany) obj.push(o);else obj[el.name].push(o);
          } else {
            obj[el.name] = o;
          }
        }
      }
    });
  });
  _.forEach(typeDef.attributes, function (attr) {
    var name = attr.name,
        attrType = attr.type;

    if (name && attrType) {
      var val = node.getAttribute(name);
      if (val) obj[name] = wsdl.convertValue(attrType, val);
    }
  });
  return obj;
}

function processFault(wsdl, fault, context) {
  var faultCode = getNodeData(firstNode(fault.getElementsByTagName('faultcode')));
  var faultString = getNodeData(firstNode(fault.getElementsByTagName('faultstring')));
  var faultNode = getFirstChildElement(firstNode(fault.getElementsByTagName('detail')));
  var typeAttr = wsdl.getTypeAttribute(faultNode);
  var faultTypeName = typeAttr.value || typeAttr.nodeValue || faultNode.localName;
  var faultType = wsdl.getTypeByLocalNS(faultNode.namespaceURI, faultTypeName);

  return {
    faultCode: faultCode,
    message: faultString,
    type: faultTypeName,
    detail: deserialize(wsdl, faultType, faultNode, context)
  };
}

function createServices(wsdl) {
  var _this = this;

  var services = {};
  _.forEach(wsdl.metadata.namespaces, function (namespace, nsIdx) {
    _.forEach(namespace.ports, function (port, portIdx) {
      var soapVars = _.find(SOAP, { version: port.soapVersion });
      _.forEach(port.operations, function (_opName, opIdx) {
        var opPath = '["' + port.service + '"]["' + port.name + '"]["' + _opName + '"]';
        _.set(services, opPath, function (data, options) {
          return new Promise$1(function (resolve, reject) {
            var _envelope;

            // adding options for future, for now, do a noop
            var opts = _.isObject(options) ? options : {};
            _.noop(opts);

            var endpoint = getEndpointFromPort(_this, port);

            var _wsdl$getOp = wsdl.getOp([nsIdx, portIdx, opIdx]),
                _wsdl$getOp2 = slicedToArray(_wsdl$getOp, 2),
                input = _wsdl$getOp2[0],
                output = _wsdl$getOp2[1];

            var soapAction = input.action;
            var opName = input.name;
            var inputTypePrefix = wsdl.getNSPrefix(input.type);

            var _serialize = serialize(wsdl, input.type, data),
                obj = _serialize.obj,
                nsUsed = _serialize.nsUsed;

            var envelope = (_envelope = {}, babelHelpers.defineProperty(_envelope, '@xmlns:' + SOAPENV_PREFIX, soapVars.envelope), babelHelpers.defineProperty(_envelope, '@xmlns:' + SOAPENC_PREFIX, soapVars.encoding), babelHelpers.defineProperty(_envelope, '@xmlns:' + XSI_PREFIX, XSI_NS), babelHelpers.defineProperty(_envelope, '@xmlns:' + XS_PREFIX, XS_NS), _envelope);
            var header = {};
            var xmlBody = {};

            _.forEach(_.union(nsUsed, [inputTypePrefix]), function (prefix) {
              xmlBody['@xmlns:' + prefix] = wsdl.getNSURIByPrefix(prefix);
            });

            xmlBody[inputTypePrefix + ':' + opName] = obj;
            envelope[SOAPENV_PREFIX + ':Header'] = header;
            envelope[SOAPENV_PREFIX + ':Body'] = xmlBody;

            var inputXML = xmlbuilder.create(defineProperty({}, SOAPENV_PREFIX + ':Envelope', envelope)).end({
              pretty: true,
              encoding: _this.options.encoding || 'UTF-8'
            });

            var headers = {
              'Content-Type': soapVars.contentType,
              'Content-Length': inputXML.length,
              SOAPAction: soapAction,
              'User-Agent': _this.options.userAgent
            };
            _this._security.addHttpHeaders(headers);

            var requestObj = { headers: headers, url: endpoint, body: inputXML };
            _this.emit('soap.request', requestObj);
            request.post(requestObj, function (error, res, body) {
              if (error) {
                var errResponse = { error: error, res: res, body: body };
                _this.emit('soap.error', errResponse);
                return reject(errResponse);
              }
              _this.lastResponse = res;
              var doc = new xmldom.DOMParser().parseFromString(body);
              var soapEnvelope = firstNode(doc.getElementsByTagNameNS(soapVars.envelope, 'Envelope'));
              var soapBody = firstNode(doc.getElementsByTagNameNS(soapVars.envelope, 'Body'));
              var soapFault = firstNode(soapBody.getElementsByTagNameNS(soapVars.envelope, 'Fault'));
              var xsiPrefix = _.findKey(soapEnvelope._nsMap, function (nsuri) {
                return nsuri === XSI_NS;
              });
              var context = { xsiPrefix: xsiPrefix };

              if (soapFault) {
                var fault = processFault(wsdl, soapFault, context);
                _this.emit('soap.fault', { fault: fault, res: res, body: body });
                return reject(fault);
              }

              var result = deserialize(wsdl, output.type, getFirstChildElement(soapBody), context);
              _this.emit('soap.response', { res: res, body: body });
              return resolve(result);
            });
          });
        });
      });
    });
  });
  return services;
}

/*
 * The purpose of this library is to allow the developer to specify
 * or provide a function that can be used to identify the key to store
 * the metadata cache in localstorage
 * when using a function, the done callback should provide the key
 */
var tools = {
  lodash: _,
  request: request,
  xmldom: xmldom,
  xmlbuilder: xmlbuilder
};

function cacheKey(key, wsdl, done) {
  if (_.isString(key)) return done(null, key);else if (_.isFunction(key)) return key(tools, wsdl, done);
  return done();
}

var VERSION = '0.1.0';

var SoapConnectClient = function (_EventEmitter) {
  inherits(SoapConnectClient, _EventEmitter);

  function SoapConnectClient(wsdlAddress, options) {
    var _ret;

    classCallCheck(this, SoapConnectClient);

    var _this = possibleConstructorReturn(this, (SoapConnectClient.__proto__ || Object.getPrototypeOf(SoapConnectClient)).call(this));

    if (!_.isString(wsdlAddress)) throw new Error('No WSDL provided');
    _this.options = _.isObject(options) ? options : {};

    _this.options.endpoint = _this.options.endpoint || url.parse(wsdlAddress).host;
    _this.options.userAgent = _this.options.userAgent || 'soap-connect/' + VERSION;
    _this.types = {};
    _this.lastResponse = null;
    _this._security = new Security.Security();

    if (_this.options.ignoreSSL) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    return _ret = new Promise(function (resolve, reject) {
      return cacheKey(_this.options.cacheKey, wsdlAddress, function (error, _cacheKey) {
        if (error) return reject(error);

        return WSDL(wsdlAddress, _this.options, _cacheKey).then(function (wsdlInstance) {
          _this.wsdl = wsdlInstance;
          _this.types = createTypes(wsdlInstance);
          _this.services = createServices.call(_this, wsdlInstance);
          return resolve(_this);
        }, reject);
      });
    }), babelHelpers.possibleConstructorReturn(_this, _ret);
  }

  createClass(SoapConnectClient, [{
    key: 'setSecurity',
    value: function setSecurity(security) {
      if (!(security instanceof Security.Security)) {
        throw new Error('Invalid security object');
      }
      this._security = security;
    }
  }]);
  return SoapConnectClient;
}(EventEmitter);

var createClient = function (mainWSDL, options) {
  return new SoapConnectClient(mainWSDL, options);
};

var soap = {
  createClient: createClient,
  Cache: Store,
  Security: Security,
  SoapConnectClient: SoapConnectClient
};

/*
 * cacheKey function to allow re-use of cache on same api version and type
 */
var REQUEST_TIMEOUT = 2000;

var SI_XML = '<?xml version="1.0"?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body xmlns:vim25="urn:vim25">\n    <vim25:RetrieveServiceContent>\n      <vim25:_this type="ServiceInstance">ServiceInstance</vim25:_this>\n    </vim25:RetrieveServiceContent>\n  </soapenv:Body>\n</soapenv:Envelope>';

function cacheKey$1(tools, wsdl, done) {
  var request$$1 = tools.request,
      xmldom$$1 = tools.xmldom;

  var url$$1 = wsdl.replace(/.wsdl.*$/, '');
  var headers = {
    'Content-Type': 'text/xml',
    'Content-Length': SI_XML.length
  };

  request$$1.post({ headers: headers, url: url$$1, body: SI_XML, timeout: REQUEST_TIMEOUT }, function (err, res, body) {
    try {
      if (err) return done(err);
      var doc = new xmldom$$1.DOMParser().parseFromString(body);
      var apiType = _.get(doc.getElementsByTagName('apiType'), '[0].textContent');
      var apiVersion = _.get(doc.getElementsByTagName('apiVersion'), '[0].textContent');
      if (apiType && apiVersion) {
        return done(null, 'VMware-' + apiType + '-' + apiVersion);
      }
      throw new Error('Unable to determine cache key');
    } catch (error) {
      return done(error, null);
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

  // Required update to all ManagedEntities
};ManagedEntity = _.merge({}, ManagedEntity, {
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
 * Resolves the vim type name without case sensetivity
 * and adds friendly shortcuts like vm for VirtualMachine
 * host for HostSystem, etc.
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
  // default to latest apiVersion
  var types$$1 = _.get(types, apiVersion) || _.get(types, _.last(_.keys(types)));
  _.forEach(types$$1, function (v, k) {
    typeMap[_.toLower(k)] = k;
  });
  return function (type) {
    return _.get(typeMap, _.toLower(type));
  };
}

function moRef(type, value) {
  var t = _.isString(type) ? type : _.get(type, 'type');
  var v = _.isString(type) ? value : _.get(type, 'value', _.get(type, 'id'));

  if (!t || !v) throw new Error('cannot resolve moRef, missing type info');
  return { type: t, value: v };
}

function isMoRef(value) {
  return _.isString(_.get(value, 'type')) && _.isString(_.get(value, 'value', _.get(value, 'id')));
}

var BaseBuilder = function () {
  function BaseBuilder(client, defaultConfig) {
    classCallCheck(this, BaseBuilder);

    this._resolve = Promise.resolve();
    this.client = client;
    this.apiVersion = client.apiVersion.match(/^\d+\.\d+$/) ? this.client.apiVersion + '.0' : this.client.apiVersion;
    this._config = defaultConfig;
  }

  /**
   * Creates a copy of the config and returns it
   */


  createClass(BaseBuilder, [{
    key: '$config',
    value: function $config() {
      return _.merge({}, this._config);
    }

    /**
     * Gets a value from the config object
     * @param path
     * @param defaultValue
     */

  }, {
    key: '$get',
    value: function $get(path$$1, defaultValue) {
      return _.get(this._config, path$$1, defaultValue);
    }

    /**
     * Manually sets a configuration value at the specific path
     * @param path
     * @param value
     */

  }, {
    key: '$set',
    value: function $set(path$$1, value) {
      _.set(this._config, path$$1, value);
      return this;
    }
  }, {
    key: '$push',
    value: function $push(path$$1, value) {
      var obj = this.$get(path$$1);
      if (!_.isArray(obj)) this.$set(path$$1, []);
      obj = this.$get(path$$1);
      obj.push(value);
      return this;
    }

    /**
     * Merges a subset of configuration into the main config
     * @returns {VirtualMachineConfigBuilder}
     */

  }, {
    key: '$merge',
    value: function $merge() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._config = _.merge.apply(this, args.unshift(this._config));
      return this;
    }

    /**
     * Checks if the api version is greater than or equal to the required version
     * @param requiredVersion - must be in semver format major.minor.patch
     * @returns {*}
     */

  }, {
    key: '$versionGTE',
    value: function $versionGTE(requiredVersion) {
      return semver.gte(this.apiVersion, requiredVersion);
    }

    /**
     * Checks if the values passed is formatted as a moref
     * @param value
     * @returns {*}
     */

  }, {
    key: '$isMoRef',
    value: function $isMoRef(value) {
      return isMoRef(value);
    }

    /**
     * converts a type and value to a moref
     * @param type
     * @param value
     * @returns {{type, value}|*}
     */

  }, {
    key: '$moRef',
    value: function $moRef(type, value) {
      return moRef(type, value);
    }

    /**
     * resolves a moref by path or moref
     * @param value
     * @param field
     * @returns {BaseBuilder}
     */

  }, {
    key: '$resolveMoRef',
    value: function $resolveMoRef(value, field) {
      var _this = this;

      this._resolve = this._resolve.then(function () {
        var getMoRef = _.isString(value) ? _this.client.moRef(value) : _this.$isMoRef(value) ? Promise.resolve(value) : Promise.reject(new Error('invalid moRef supplied for "' + field + '"'));
        return getMoRef.then(function (_moRef) {
          return _this.$set(field, _moRef);
        });
      });

      return this;
    }
  }, {
    key: '$resolveAndSet',
    value: function $resolveAndSet(value, path$$1) {
      var _this2 = this;

      this._resolve = this._resolve.then(function () {
        _this2.$set(path$$1, value);
      });

      return this;
    }

    /**
     * checks if the value is a potential config object
     * @param value
     * @returns {boolean}
     */

  }, {
    key: '$isConfigObject',
    value: function $isConfigObject(value) {
      return _.isObject(value) && !_.isBuffer(value) && !_.isDate(value) && _.keys(value).length;
    }

    /**
     * Adds dynamic data to the config
     * @param key
     * @param value
     * @returns {BaseBuilder}
     */

  }, {
    key: 'dynamicData',
    value: function dynamicData(key, value) {
      this.$set(key, value);
      return this;
    }
  }]);
  return BaseBuilder;
}();

function nicTypeMapper(type) {
  switch (_.toLower(type)) {
    case 'vmxnet':
    case 'vmxnet3':
    case 'virtualvmxnet3':
      return 'VirtualVmxnet3';
    case 'vmxnet2':
    case 'virtualvmxnet2':
      return 'VirtualVmxnet2';
    case 'e1000':
    case 'virtuale1000':
      return 'VirtualE1000';
    case 'e1000e':
    case 'virtuale1000e':
      return 'VirtualE1000e';
    case 'pcnet32':
    case 'pcnet':
    case 'virtualpcnet32':
      return 'VirtualPCNet32';
    case 'sriov':
    case 'sriovethernetcard':
    case 'virtualsriovethernetcard':
      return 'VirtualSriovEthernetCard';
    default:
      return 'VirtualE1000';
  }
}

function nicBackingMapper(networkType) {
  switch (_.toLower(networkType)) {
    case 'network':
      return 'VirtualEthernetCardNetworkBackingInfo';
    case 'distributedvirtualportgroup':
      return 'VirtualEthernetCardDistributedVirtualPortBackingInfo';
    default:
      return 'VirtualEthernetCardNetworkBackingInfo';
  }
}

// import SpecProxy from './SpecProxy'
var INV_PATH_RX = /^(\/.*)\/(host|vm|datastore|network)(\/.*)?$/;

var CreateVirtualMachineArgs = function (_BaseBuilder) {
  inherits(CreateVirtualMachineArgs, _BaseBuilder);

  function CreateVirtualMachineArgs(client) {
    classCallCheck(this, CreateVirtualMachineArgs);

    var _this2 = possibleConstructorReturn(this, (CreateVirtualMachineArgs.__proto__ || Object.getPrototypeOf(CreateVirtualMachineArgs)).call(this, client, {}));

    _this2._dcPath = null;
    _this2._name = null;
    _this2._datastore = null;
    return _this2;
  }

  createClass(CreateVirtualMachineArgs, [{
    key: '_this',
    value: function _this(value) {
      var match = value.match(INV_PATH_RX);
      if (match) this._dcPath = match[1];
      this.$resolveMoRef(value, '_this');
      return this;
    }
  }, {
    key: 'pool',
    value: function pool(value) {
      var _value = value;
      if (_.isString(_value)) {
        _value = _value.replace(new RegExp('^' + this._dcPath + '/?'), '').replace(/^host\/?/, '');
        _value = this._dcPath + '/host/' + _value;
      }
      this.$resolveMoRef(_value, 'pool');
      return this;
    }
  }, {
    key: 'host',
    value: function host(value) {
      var _value = value;
      if (_.isString(_value)) {
        _value = _value.replace(new RegExp('^' + this._dcPath + '/?'), '').replace(/^host\/?/, '');
        _value = this._dcPath + '/host/' + _value;
      }
      this.$resolveMoRef(_value, 'host');
      return this;
    }
  }, {
    key: 'config',
    value: function config(spec) {
      var _this3 = this;

      this._resolve = this._resolve.then(function () {
        _this3.$merge(spec);
      });
      return this;
    }

    /*
     * Shortcut methods
     */

  }, {
    key: 'name',
    value: function name(value) {
      var _this4 = this;

      this._resolve = this._resolve.then(function () {
        _this4._name = value;
        _this4.$set('config.name', value);
      });
      return this;
    }
  }, {
    key: 'memory',
    value: function memory(size) {
      var _this5 = this;

      this._resolve = this._resolve.then(function () {
        var mem = 512;
        if (_.isNumber(size)) {
          return _this5.$set('config.memoryMB', Math.floor(size));
        } else if (_.isString(size)) {
          var match = size.match(/^(\d+)(m|mb|g|gb|t|tb)?$/i);
          if (match && match[1]) {
            mem = Math.floor(Number(match[1]));

            switch (match[2]) {
              case 'm':
              case 'mb':
                return _this5.$set('config.memoryMB', mem);
              case 'g':
              case 'gb':
                return _this5.$set('config.memoryMB', mem * 1024);
              case 't':
              case 'tb':
                return _this5.$set('config.memoryMB', mem * 1024 * 1024);
              default:
                return _this5.$set('config.memoryMB', mem);
            }
          }
        }
        throw new Error('invalid memory size');
      });
      return this;
    }
  }, {
    key: 'cpus',
    value: function cpus(cores, coresPerSocket) {
      var _this6 = this;

      this._resolve = this._resolve.then(function () {
        if (!_.isNumber(cores)) throw new Error('cpu cores must be integer');
        _this6.$set('config.numCPUs', Math.floor(cores));

        if (_this6.$versionGTE('5.0.0') && _.isNumber(coresPerSocket)) {
          _this6.$set('config.coresPerSocket', Math.floor(coresPerSocket));
        }
      });
      return this;
    }
  }, {
    key: 'addNic',
    value: function addNic(network, type, options) {
      var _this7 = this;

      var opts = _.isObject(options) ? options : {};
      var _network = network;

      if (_.isString(_network)) {
        _network = _network.replace(new RegExp('^' + this._dcPath + '/?'), '').replace(/^network\/?/, '');
        _network = this._dcPath + '/network/' + _network;
      }
      this._resolve = this._resolve.then(function () {
        // get the network details
        var getMoRef = _.isString(_network) ? _this7.client.moRef(_network) : _this7.$isMoRef(_network) ? Promise$1.resolve(_network) : Promise$1.reject(new Error('invalid moRef supplied for "network"'));

        return getMoRef.then(function (moRef) {
          return _this7.client.retrieve({
            type: moRef.type,
            id: moRef.value,
            properties: moRef.type === 'DistributedVirtualPortgroup' ? ['name', 'config.distributedVirtualSwitch'] : ['name']
          }).then(function (net) {
            var n = _.first(net);
            var netName = _.get(n, 'name', 'VM Network');
            return moRef.type === 'DistributedVirtualPortgroup' ? _this7.client.retrieve({
              type: _.get(n, 'config.distributedVirtualSwitch.type'),
              id: _.get(n, 'config.distributedVirtualSwitch.value'),
              properties: ['uuid']
            }).then(function (dvs) {
              return {
                name: netName,
                uuid: _.get(dvs, '[0].uuid')
              };
            }) : { name: netName };
          }).then(function (net) {
            if (!_.isArray(_this7.$get('config.deviceChange'))) {
              _this7.$set('config.deviceChange', []);
            }
            var key = _this7.$get('config.deviceChange').length;
            var change = _.merge({
              operation: 'add',
              device: {
                '@xsi:type': 'vim25:' + nicTypeMapper(type),
                backing: {
                  '@xsi:type': 'vim25:' + nicBackingMapper(moRef.type),
                  deviceName: net.name,
                  useAutoDetect: true,
                  network: moRef,
                  port: net.uuid ? { switchUuid: net.uuid } : undefined
                },
                connectable: {
                  connected: true,
                  startConnected: true,
                  allowGuestControl: true
                },
                deviceInfo: {
                  label: 'NetworkAdapter ' + (key + 1),
                  summary: net.name
                },
                key: key,
                addressType: 'generated',
                wakeOnLanEnabled: true,
                present: true
              }
            }, opts);

            _this7.$push('config.deviceChange', change);
          });
        });
      });

      return this;
    }
  }, {
    key: '_args',
    get: function get$$1() {
      var _this8 = this;

      return this._resolve.then(function () {
        return _this8.$config();
      });
    }
  }]);
  return CreateVirtualMachineArgs;
}(BaseBuilder);

// import monitor from '../monitor/index'
// import { isMoRef } from '../common/moRef'
/**
 * THIS IS A WORK IN PROGRESS
 */

/**
 *
 * @param parent {String|Object} - parent path or moref
 * @param type
 * @param config
 * @param options
 * @returns {*|Promise.<*>|Promise.<TResult>}
 */
function create(type, config, options) {
  _.noop(options);
  try {
    var _type = this.typeResolver(type);

    switch (_type) {
      case 'VirtualMachine':
        if (_.isFunction(config)) {
          var vmArgs = new CreateVirtualMachineArgs(this);
          config(vmArgs);
          return vmArgs._args;
        }
        return Promise$1.resolve(config);
      default:
        throw new Error('"' + type + '" is not supported in create operation');
    }

    // return this.createSpec(moRef, type, config, options)
  } catch (err) {
    return Promise$1.reject(err);
  }
}

var ONE_MINUTE_IN_MS = 60000;
var ONE_SECOND_IN_MS = 1000;
var FIRST_INTERVAL = 500;
var ERROR = 'error';
var SUCCESS = 'success';
// const QUEUED = 'queued'
// const RUNNING = 'running'

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

      // short first interval for quick tasks like rename
      _this.monitor(FIRST_INTERVAL);
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

          if (!state) {
            return _this2.reject(new Error('task ' + _this2.taskId + ' was not found'));
          }
          _this2.client.emit('task.state', { id: _this2.taskId, state: state });

          switch (state) {
            case ERROR:
              return _this2.reject(new Error({ task: _this2.taskId, info: task }));
            case SUCCESS:
              return _this2.resolve(task);
            default:
              return Date.now() - _this2.start >= _this2.timeout ? _this2.reject(new Error('the task monitor timed out, ' + 'the task may still complete successfully')) : _this2.monitor(_this2.interval);
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

var CookieSecurity$2 = soap.Security.CookieSecurity;

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
      return Promise$1.reject(new Error('token authentication is ' + 'no supported on host, use username/password'));
    }
    this._token = token;
    this.setSecurity(CookieSecurity$2('vmware_soap_session="' + this._token + '"'));

    return this.retrieve({
      type: 'SessionManager',
      id: 'SessionManager',
      properties: ['currentSession']
    }).then(function (sessions) {
      _this.loggedIn = true;
      _this._session = _.get(sessions, '[0].currentSession');
      return _this._session;
    });
  } else if (username && password) {
    return this.method('Login', {
      _this: this.serviceContent.sessionManager,
      userName: username,
      password: password
    }).then(function (session) {
      _this.loggedIn = true;
      _this._soapClient.setSecurity(CookieSecurity$2(_this._soapClient.lastResponse.headers));
      _this._token = getToken(_this._soapClient.lastResponse.headers);
      _this._session = session;
      return _this._session;
    });
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
    return possibleConstructorReturn(this, (ObjectReferenceError.__proto__ || Object.getPrototypeOf(ObjectReferenceError)).call(this, 'ObjectReferenceError', ERR_OBJECT_REF, 'Object reference ' + 'cannot be determined. Please supply' + 'either a valid moRef object ({ type, value }) or type and id'));
  }

  return ObjectReferenceError;
}(VSphereConnectError);

function method(name, args) {
  var _args = _.isObject(args) ? args : {};
  var _method = _.get(this._VimPort, '["' + name + '"]');

  return _.isFunction(_method) ? method(_args).then(function (result) {
    return _.get(result, 'returnval', result);
  }) : Promise$1.reject(new InvalidMethodError(name));
}

function moRef$2(inventoryPath) {
  try {
    return this.method('FindByInventoryPath', {
      _this: this.serviceContent.searchIndex,
      inventoryPath: inventoryPath
    });
  } catch (error) {
    return Promise$1.reject(error);
  }
}

function reconfig(moRef, config, options) {
  var _this = this;

  try {
    var type = this.typeResolver(type);
    var spec = this.updateSpec(moRef, config, options);
    switch (type) {
      case 'VirtualMachine':
        return this.method('ReconfigVM_Task', spec).then(function (task$$1) {
          return _.get(options, 'async') === false ? monitor.task(_this, _.get(task$$1, 'value'), options) : task$$1;
        });
      default:
        throw new Error('"' + type + '" is not supported in update operation');
    }
  } catch (err) {
    return Promise$1.reject(err);
  }
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

  if (!_.isString(name)) {
    return Promise$1.reject(new Error('missing name parameter in rename operation'));
  }
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
        path$$1 = _ref.path;
    classCallCheck(this, TraversalSpec);

    this.type = type;
    this.path = path$$1;
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
      }
      return _.map(this.obj.id, function (id) {
        return { obj: moRef(_this.obj.type, id) };
      });
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
      recursive = this.obj.recursive !== false;
      var listSpec = _.get(types, '["' + this.client.apiVersion + '"]["' + type + '"].listSpec');
      if (!listSpec && !this.obj.id.length) {
        return Promise$1.reject('Unable to list vSphere type, ' + 'try with a specific object id');
      }

      // get the container view if no object specified
      // this is used for listing entire collections of object types
      if (!this.obj.id.length && listSpec.type === 'ContainerView') {
        resolveView = this.client.method('CreateContainerView', {
          _this: viewManager,
          container: container,
          type: type,
          recursive: recursive
        });
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

  _.forEach(_.isArray(specSet) ? specSet : [specSet], function (_spec) {
    var spec = _spec;
    if (_.isString(spec)) spec = { type: spec };
    if (!spec.type) return;
    if (!_.has(types, spec.type)) {
      _.set(types, spec.type, { ids: [], props: [] });
    }
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

  var _args = _.isObject(args) ? _.cloneDeep(args) : {};
  var _options = _.isObject(options) ? _.cloneDeep(options) : {};

  var limit = _options.limit;
  var skip = _options.skip || 0;
  var nth = _.isNumber(_options.nth) ? Math.ceil(_options.nth) : null;
  var properties = _.get(_args, 'properties', []);
  var moRef = true;
  var orderBy = _options.orderBy ? orderDoc(_options.orderBy) : null;
  var fn = _.isFunction(_options.resultHandler) ? _options.resultHandler : function (result) {
    return result;
  };
  _args.properties = _.without(properties, 'moRef', 'id', 'moRef.value', 'moRef.type');

  if (_.isNumber(skip) && _.isNumber(limit)) limit += skip;

  var retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties';
  var specMap = _.map(graphSpec(_args), function (s) {
    return PropertyFilterSpec$1(s, _this3).spec;
  });
  var _this = this.serviceContent.propertyCollector;

  return Promise$1.all(specMap).then(function (specSet) {
    return _this3.method(retrieveMethod, { _this: _this, specSet: specSet, options: {} }).then(function (result) {
      return getResults.call(_this3, result, [], limit, skip, nth, orderBy, moRef, fn);
    });
  });
}

var methods$1 = {
  create: create,
  destroy: destroy,
  login: login,
  logout: logout,
  method: method,
  moRef: moRef$2,
  reconfig: reconfig,
  reload: reload,
  rename: rename,
  retrieve: retrieve
};

var RETRIEVE = 'RETRIEVE';

var debug = Debug('vconnect.rb');

var RequestBuilder = function () {
  function RequestBuilder(client, parent) {
    classCallCheck(this, RequestBuilder);

    this.client = client;
    this.parent = parent;
    this.term = client._connection;
    this.operation = null;
    this.error = null;
    this.args = {};
    this.options = {};
    this.single = false;
    this._value = undefined;
    this.allData = false;
  }

  createClass(RequestBuilder, [{
    key: 'reset',
    value: function reset() {
      this.operation = null;
      this.error = null;
      this.args = {};
      this.options = {};
      this.single = false;
      this._value = undefined;
      this.allData = false;
    }
  }, {
    key: 'assignProps',
    value: function assignProps(rb) {
      rb.error = this.error;
      rb.operation = this.operation;
      rb.args = _.cloneDeep(this.args);
      rb.options = _.cloneDeep(this.options);
      rb.single = this.single;
    }
  }, {
    key: 'toResult',
    value: function toResult(value) {
      return this.single && _.isArray(value) ? _.first(value) : value;
    }
  }, {
    key: 'next',
    value: function next(handler, isDefault) {
      var _this = this;

      var rb = new RequestBuilder(this.client, this);

      rb.term = this.term.then(function (value) {
        _this._value = value;
        _this.assignProps(rb);
        if (rb.error && !isDefault) return null;
        if (isDefault) rb.error = null;
        return _.isFunction(handler) ? handler(value, rb) : value;
      });

      return new v(this.client, rb);
    }
  }, {
    key: 'value',
    get: function get$$1() {
      var _this2 = this;

      return this.term.then(function (value) {
        switch (_this2.operation) {
          case RETRIEVE:
            debug('retrieving - %o', { args: _this2.args, options: _this2.options });
            if (_this2.allData) _this2.args.properties = [];
            if (!_this2.args.properties) _this2.args.properties = ['moRef', 'name'];
            return _this2.client.retrieve(_this2.args, _this2.options).then(function (result) {
              _this2.operation = null;
              _this2._value = _this2.toResult(result);
              return _this2._value;
            });
          default:
            break;
        }
        _this2._value = _this2.toResult(value);
        return _this2._value;
      });
    }
  }]);
  return RequestBuilder;
}();

var debug$1 = Debug('vconnect.changefeed');

var DEFAULT_INTERVAL_MS = 10000;
var CREATED = 'enter';
var UPDATED = 'modify';
var DESTROYED = 'leave';
var CHANGE = 'change';

function getId(obj) {
  var moRef = obj.moRef || obj.obj;
  var type = _.get(moRef, 'type', 'unknown');
  var id = _.get(moRef, 'value', 'unknown');
  return type + '-' + id;
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
  function ChangeFeed(rb, options) {
    var _this2 = this;

    classCallCheck(this, ChangeFeed);

    debug$1('creating a new changefeed');
    debug$1('args %O', rb.args);
    debug$1('options %O', rb.options);

    this._client = rb.client;
    this._request = rb;
    this._options = options;
    this._interval = null;
    this._emitter = new EventEmitter();
    this._observable = Rx.Observable.fromEvent(this._emitter, CHANGE).finally(function () {
      _this2.close();
    });

    debug$1('using method %s', this._waitMethod);

    var intervalMS = _.get(options, 'interval');
    this._intervalMS = _.isNumber(intervalMS) ? Math.ceil(intervalMS) : DEFAULT_INTERVAL_MS;

    debug$1('using interval %d', this._intervalMS);

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
        if (_this3._request.allData) reqArgs.properties = [];
        reqArgs.properties = reqArgs.properties || ['moRef', 'name'];
        reqArgs.properties = _.without(reqArgs.properties, 'moRef', 'id');
        var specMap = _.map(graphSpec(reqArgs), function (s) {
          return PropertyFilterSpec$1(s, _this3._client).spec;
        });
        var _this = _this3._client.serviceContent.propertyCollector;
        _this3._VimPort = _this3._client._VimPort;
        _this3._waitMethod = _this3._VimPort.WaitForUpdatesEx ? 'WaitForUpdatesEx' : 'WaitForUpdates';

        return Promise$1.all(specMap).then(function (specSet) {
          debug$1('specMap %j', specSet);
          return _this3._client.method('CreatePropertyCollector', { _this: _this }).then(function (collector) {
            _this3.collector = collector;
            return Promise$1.each(specSet, function (spec) {
              return _this3._client.method('CreateFilter', {
                _this: collector,
                spec: spec,
                partialUpdates: false
              });
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
          var change = {};
          change['old_val'] = null;
          change['new_val'] = null;

          if (obj.kind === CREATED) {
            change['new_val'] = formatChange(obj);
            _.set(creates, id, change.new_val);
          } else {
            var newVal = _.cloneDeep(_.get(_this4.currentVal, id, {}));
            change['old_val'] = _.cloneDeep(newVal);

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
              change['new_val'] = newVal;
            } else {
              debug$1('unhandled kind %s', obj.kind);
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
      debug$1('update running');
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

function makeDotPath(obj) {
  var list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var path$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  _.forEach(obj, function (val, key) {
    var prop = path$$1.slice(0);
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

function processBranch(args, resolve, reject) {
  var condition = args.shift();
  var val = args.shift();
  var las = _.last(args);

  return (condition instanceof v ? condition._rb.value : Promise$1.resolve(condition)).then(function (c) {
    if (c === true) {
      return (val instanceof v ? val._rb.value : Promise$1.resolve(_.isFunction(val) ? val() : val)).then(resolve, reject);
    } else if (args.length === 1) {
      return (las instanceof v ? las._rb.value : Promise$1.resolve(_.isFunction(las) ? las() : las)).then(resolve, reject);
    }
    return processBranch(args, resolve, reject);
  }, reject);
}

var v = function () {
  function v(client, rb) {
    classCallCheck(this, v);

    this._rb = null;

    var term = function term(field) {
      return term.value(field);
    };
    Object.setPrototypeOf(term, v.prototype);

    term._rb = rb instanceof RequestBuilder ? rb : new RequestBuilder(client);

    return term;
  }

  /**
   * returns add data from the current type
   */


  createClass(v, [{
    key: 'allData',
    value: function allData() {
      return this._rb.next(function (value, rb) {
        rb.args.properties = [];
        rb.allData = true;
        return value;
      });
    }

    /**
     * performs an if then else
     */

  }, {
    key: 'branch',
    value: function branch() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this._rb.next(function (value, rb) {
        var _args = args.length === 2 ? _.union([value], args) : args;

        if (_args.length < 3 || _args.length % 2 !== 1) {
          rb.error = 'branch has an invalid number of arguments';
          return;
        }
        return new Promise$1(function (resolve, reject) {
          return processBranch(_args, resolve, reject);
        });
      });
    }

    /**
     * creates a new changefeed and returns an observable
     * @param options
     * @returns {*}
     */

  }, {
    key: 'changes',
    value: function changes(options) {
      return new ChangeFeed(this._rb, options).create();
    }

    /**
     * sets the cluster path
     * @param name
     * @returns {*}
     */

  }, {
    key: 'cluster',
    value: function cluster(name) {
      return this._rb.next(function (value, rb) {
        if (!rb.args._clusterName) {
          rb.args._clusterName = name;

          if (rb.args._inventoryPath) {
            if (rb.args._inventoryPath.match(/\/.*\/host(\/.*)?$/)) {
              rb.args._inventoryPath = rb.args._inventoryPath + '/' + name;
            } else {
              rb.args._inventoryPath = rb.args._inventoryPath + '/host/' + name;
            }
          }
        }

        return value;
      });
    }

    /**
     * create a new managed object type
     * @param path
     * @param configs
     * @param options
     */

  }, {
    key: 'create',
    value: function create(path$$1, config, options) {
      var _this = this;

      if (!_.isFunction(config) && !_.isObject(config)) {
        throw new Error('InvalidArgumentError: config must be ' + 'function or object');
      }
      var opts = _.isObject(options) ? options : {};

      var wrapConfig = function wrapConfig(c) {
        c._this(path$$1);
        config(c);
      };

      return this._rb.next(function (value, rb) {
        rb.operation = 'CREATE';
        return _this._rb.client.create(rb.args.type, wrapConfig, opts);
      });
    }

    /**
     * returns the backend client
     * @returns {*}
     */

  }, {
    key: 'createClient',
    value: function createClient(cb) {
      var _this2 = this;

      return this._rb.client._connection.then(function () {
        return cb(_this2._rb.client);
      });
    }

    /**
     * set the datacenter path for commands
     * @param name
     */

  }, {
    key: 'datacenter',
    value: function datacenter(name) {
      return this._rb.next(function (value, rb) {
        if (!rb.args._datacenterName) {
          rb.args._datacenterName = name;
          rb.args._inventoryPath = rb.args._inventoryPath ? rb.args._inventoryPath + '/' + name : '/' + name;
        }
        return value;
      });
    }

    /**
     * sets a default value if there is an error and clears the error
     * @param val
     */

  }, {
    key: 'default',
    value: function _default(val) {
      var _this3 = this;

      return this._rb.next(function (_value, rb) {
        return _this3._rb.value.then(function (value) {
          rb.operation = 'DEFAULT';
          var error = _this3._rb.error ? _this3._rb.error : value === undefined ? new Error('NoResultsError: the selection has no results') : null;
          _this3._rb.error = null;
          rb.error = null;

          return error ? _.isFunction(val) ? val(error) : val : value;
        });
      }, true);
    }

    /**
     * destroys all of the vms in the selection
     * @param options
     */

  }, {
    key: 'destroy',
    value: function destroy(options) {
      var _this4 = this;

      return this._rb.next(function () {
        return _this4._rb.value.then(function (value) {
          _this4.operation = 'DESTROY';
          return Promise$1.map(_.castArray(value), function (mo) {
            return _this4._rb.client.destroy(mo.moRef, options);
          });
        });
      });
    }

    /**
     * performs one or more operations and feeds them into a handler function
     */

  }, {
    key: 'do',
    value: function _do() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var fn = _.last(args);
      if (!_.isFunction(fn)) throw new Error('invalid value for do');

      return this._rb.next(function (value) {
        var params = _.map(args.length > 1 ? args.slice(0, args.length - 1) : [value], function (param) {

          return param instanceof v ? param._rb.value : _.isFunction(param) ? param() : param;
        });

        return Promise$1.map(params, function (param) {
          return param;
        }).then(function (_params) {
          return fn.apply(null, _params);
        });
      });
    }

    /**
     * iterates over a set of values and executes
     * an iteratee function on their values
     * @param iteratee
     */

  }, {
    key: 'each',
    value: function each(iteratee) {
      var _this5 = this;

      return this._rb.next(function (_value, rb) {
        return _this5._rb.value.then(function (value) {
          rb.operation = 'EACH';
          if (!_.isArray(value)) {
            rb.error = 'cannot call each on single selection';
            return null;
          }
          return Promise$1.each(value, _.isFunction(iteratee) ? iteratee : _.identity);
        });
      });
    }

    /**
     * determines if one or more values equal the current selection
     */

  }, {
    key: 'eq',
    value: function eq() {
      var _this6 = this;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      if (!args.length) throw new Error('eq requires at least one argument');
      return this._rb.next(function (_value, rb) {
        return _this6._rb.value.then(function (value) {
          rb.operation = 'EQ';
          return Promise$1.reduce(args, function (accum, item) {
            return accum && _.isEqual(value, item);
          }, true);
        });
      });
    }

    /**
     * converts a native value into a vConnect object
     * @param val
     */

  }, {
    key: 'expr',
    value: function expr(val) {
      if (val === undefined) throw new Error('cannot wrap undefined with expr');
      return this._rb.next(function (value, rb) {
        rb.operation = 'EXPR';
        rb.single = !_.isArray(val);
        return val;
      });
    }

    /**
     * filters out all values that do not return true from the filterer function
     * @param filterer
     * @param options
     */

  }, {
    key: 'filter',
    value: function filter(filterer, options) {
      var _this7 = this;

      return this._rb.next(function (_value, rb) {
        return _this7._rb.value.then(function (value) {
          rb.operation = 'FILTER';
          if (!_.isArray(value)) {
            rb.error = 'cannot call filter on single selection';
            return null;
          }
          return Promise$1.filter(value, _.isFunction(filterer) ? filterer : _.identity, options);
        });
      });
    }

    /**
     * sets the folder path
     * @param name
     */

  }, {
    key: 'folder',
    value: function folder(name) {
      return this._rb.next(function (value, rb) {
        rb.args._folderName = name;
        rb.args._inventoryPath = rb.args._inventoryPath ? rb.args._inventoryPath + '/' + name : '/' + name;
        return value;
      });
    }

    /**
     * gets one or more managed objects by id
     */

  }, {
    key: 'get',
    value: function get$$1() {
      for (var _len4 = arguments.length, ids = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        ids[_key4] = arguments[_key4];
      }

      return this._rb.next(function (value, rb) {
        if (rb.operation === RETRIEVE) {
          rb.args.id = ids;
          rb.single = ids.length === 1;
          return value;
        }
        if (!_.isArray(value)) {
          rb.error = new Error('cannot get from non-array');
          return null;
        }
        return _.filter(value, function (mo) {
          var _$get = _.get(mo, 'moRef', {}),
              type = _$get.type,
              _value = _$get.value;

          return _.get(rb.args, 'type') === type && _.includes(ids, _value);
        });
      });
    }

    /**
     * sets the host path
     * @param name
     */

  }, {
    key: 'host',
    value: function host(name) {
      return this._rb.next(function (value, rb) {
        if (!rb.args._hostName) {
          rb.args._hostName = name;

          if (rb.args._inventoryPath) {
            if (rb.args._inventoryPath.match(/\/.*\/host(\/.*)?$/)) {
              rb.args._inventoryPath = rb.args._inventoryPath + '/' + name;
            } else {
              rb.args._inventoryPath = rb.args._inventoryPath + '/host/' + name;
            }
          }
        }

        return value;
      });
    }

    /**
     * gets the id from the current selection or object
     * @returns {*}
     */

  }, {
    key: 'id',
    value: function id() {
      var _this8 = this;

      return this._rb.next(function (_value, rb) {
        return _this8._rb.value.then(function (value) {
          rb.operation = 'ID';
          return _.isArray(value) ? _.map(value, function (val) {
            return _.get(val, 'moRef.value', null);
          }) : _.get(value, 'moRef.value', null);
        });
      });
    }

    /**
     * limits the number of results
     * @param limit
     * @returns {*}
     */

  }, {
    key: 'limit',
    value: function limit(_limit) {
      if (!_.isNumber(_limit)) throw new Error('invalid value for limit');
      return this._rb.next(function (value, rb) {
        if (rb.single) {
          rb.error = new Error('cannot limit single selection');
          return null;
        }
        if (rb.operation === RETRIEVE) {
          rb.options.limit = Math.ceil(_limit);
          return value;
        }
        if (!_.isArray(value)) {
          rb.error = new Error('cannot limit non-array');
          return null;
        }
        return _.first(value);
      });
    }

    /**
     * creates a new session or sets the token for the current instance
     * @param username
     * @param password
     */

  }, {
    key: 'login',
    value: function login(username, password) {
      return this._rb.next(function (value, rb) {
        rb.operation = 'LOGIN';
        return rb.client.login(username, password);
      });
    }

    /**
     * logs out the current session
     */

  }, {
    key: 'logout',
    value: function logout() {
      return this._rb.next(function (value, rb) {
        rb.operation = 'LOGOUT';
        return rb.client.logout();
      });
    }

    /**
     * maps a selection
     * @param mapper
     * @param options
     */

  }, {
    key: 'map',
    value: function map(mapper, options) {
      var _this9 = this;

      return this._rb.next(function (_value, rb) {
        return _this9._rb.value.then(function (value) {
          rb.operation = 'MAP';
          if (!_.isArray(value)) {
            rb.error = 'cannot call map on single selection';
            return null;
          }
          return Promise$1.map(value, _.isFunction(mapper) ? mapper : _.identity, options);
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
      return this._rb.next(function (value, rb) {
        rb.operation = 'METHOD';
        rb._value = undefined;
        return rb.client.method(name, args);
      });
    }

    /**
     * gets a managed object reference from the supplied inventory path
     * @param inventoryPath
     */

  }, {
    key: 'moRef',
    value: function moRef(inventoryPath) {
      var _inventoryPath = inventoryPath;
      return this._rb.next(function (value, rb) {
        rb.operation = 'MOREF';

        if (!_inventoryPath && rb.args._inventoryPath) {
          _inventoryPath = rb.args._inventoryPath;
        }

        return rb.client.moRef(_inventoryPath).then(function (moRef) {
          rb._value = moRef;
          return moRef;
        });
      });
    }

    /**
     * determines if one or more values equal the current selection
     */

  }, {
    key: 'ne',
    value: function ne() {
      var _this10 = this;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      if (!args.length) throw new Error('ne requires at least one argument');
      return this._rb.next(function (_value, rb) {
        return _this10._rb.value.then(function (value) {
          rb.operation = 'NE';
          return Promise$1.reduce(args, function (accum, item) {
            return accum && !_.isEqual(value, item);
          }, true);
        });
      });
    }

    /**
     * does a not operation on the current value
     * @return {*}
     */

  }, {
    key: 'not',
    value: function not() {
      var _this11 = this;

      return this._rb.next(function (_value, rb) {
        return _this11._rb.value.then(function (value) {
          rb.operation = 'NOT';
          if (value === undefined) {
            rb.error = new Error('cannot not an undefined value');
            return null;
          }
          return _.includes([false, null], value);
        });
      });
    }

    /**
     * Gets a specific record from a list of records
     * @param index
     */

  }, {
    key: 'nth',
    value: function nth(n) {
      if (!_.isNumber(n)) throw new Error('invalid value for nth');
      return this._rb.next(function (value, rb) {
        if (rb.single) {
          rb.error = new Error('cannot get nth on single selection');
          return null;
        }
        if (rb.operation === RETRIEVE) {
          rb.single = true;
          rb.options.nth = Math.ceil(n);
          return value;
        }
        if (!_.isArray(value)) {
          rb.error = new Error('cannot get nth on non-array');
          return null;
        }
        rb.single = true;
        return _.nth(value, n);
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
      return this._rb.next(function (value, rb) {
        if (rb.single) {
          rb.error = new Error('cannot order single selection');
          return null;
        }
        if (rb.operation === RETRIEVE) {
          rb.options.orderBy = doc;
          return value;
        }
        if (!_.isArray(value)) {
          rb.error = new Error('cannot order non-array');
          return null;
        }

        var _orderDoc = orderDoc(doc),
            fields = _orderDoc.fields,
            directions = _orderDoc.directions;

        return _.orderBy(value, fields, directions);
      });
    }

    /**
     * Filters down the fields that will be returned
     * @return {v}
     */

  }, {
    key: 'pluck',
    value: function pluck$$1() {
      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return this._rb.next(function (value, rb) {
        rb.allData = false;
        var propList = buildPropList(args);
        var currentProps = _.get(rb.args, 'properties', propList);
        var useProps = _.intersection(propList, currentProps);
        useProps = useProps.length ? useProps : propList;

        if (rb.operation === RETRIEVE) {
          rb.args.properties = useProps;
          return value;
        }
        return pluck(value, useProps);
      });
    }

    /**
     * Performs a reduce operation
     * @param reducer
     * @param initialValue
     */

  }, {
    key: 'reduce',
    value: function reduce(reducer, initialValue) {
      var _this12 = this;

      return this._rb.next(function (_value, rb) {
        return _this12._rb.value.then(function (value) {
          rb.operation = 'REDUCE';
          if (!_.isArray(value)) {
            rb.error = 'cannot call reduce on single selection';
            return null;
          }
          return Promise$1.reduce(value, _.isFunction(reducer) ? reducer : _.identity, initialValue);
        });
      });
    }

    /**
     * resets the request builder
     */

  }, {
    key: 'reset',
    value: function reset() {
      return this._rb.next(function (value, rb) {
        rb.reset();
        return null;
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
      return this._rb.next(function (value, rb) {
        rb.operation = 'RETRIEVE';
        rb._value = undefined;
        rb.args = args;
        rb.options = options;
        return rb.client.retrieve(args, options);
      });
    }

    /**
     * limits the number of results
     * @param limit
     * @returns {*}
     */

  }, {
    key: 'skip',
    value: function skip(n) {
      if (!_.isNumber(n) || n < 1) throw new Error('invalid value for skip');
      return this._rb.next(function (value, rb) {
        if (rb.single) {
          rb.error = new Error('cannot skip single selection');
          return null;
        }
        if (rb.operation === RETRIEVE) {
          rb.options.skip = Math.ceil(n);
          return value;
        }
        if (!_.isArray(value)) {
          rb.error = new Error('cannot skip non-array');
          return null;
        }
        return _.slice(value, Math.ceil(n));
      });
    }

    /**
     * sets the managed object type of the current request chain
     * @param name
     */

  }, {
    key: 'type',
    value: function type(name) {
      return this._rb.next(function (value, rb) {
        rb.args.type = rb.client.typeResolver(name);
        // rb.args.properties = rb.args.properties || ['moRef', 'name']
        if (!rb.args.type) {
          rb.error = 'InvalidTypeError: "' + name + '" is not a valid type or alias';
          return null;
        }
        rb._value = undefined;
        rb.operation = RETRIEVE;
        rb.single = false;

        return null;
      });
    }

    /**
     * resolves the current request chain
     * @param onFulfilled
     * @param onRejected
     * @returns {Promise.<TResult>}
     */

  }, {
    key: 'then',
    value: function then(onFulfilled, onRejected) {
      var _this13 = this;

      var _onFulfilled = _.isFunction(onFulfilled) ? onFulfilled : _.noop;
      var _onRejected = _.isFunction(onRejected) ? onRejected : _.noop;

      return this._rb.value.then(function (result) {
        _this13.operation = null;
        return _this13._rb.error ? Promise$1.reject(_this13._rb.error) : result;
      }).then(_onFulfilled, _onRejected);
    }

    /**
     * selects a specific value of the current selection
     * or object if attr is supplied or the current value if no arguments
     * @param attr
     */

  }, {
    key: 'value',
    value: function value(attr) {
      var _this14 = this;

      return this._rb.next(function (_value, rb) {
        return _this14._rb.value.then(function (value) {
          rb.operation = 'VALUE';
          if (_.isString(attr)) {
            if (_.isArray(value)) {
              return _.without(_.map(value, function (val) {
                return _.get(val, attr);
              }), undefined);
            }
            var val = _.get(value, attr);
            if (val === undefined) rb.error = 'no attribute "' + attr + ' in object"';
            return val;
          }
          return value;
        });
      });
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
   * @param [options.cacheKey] {Function} - cache key function whose
   * return value will be used as the cache key name
   * @return {v}
   */
  function VsphereConnectClient(host, options) {
    var _ret;

    classCallCheck(this, VsphereConnectClient);

    var _this = possibleConstructorReturn(this, (VsphereConnectClient.__proto__ || Object.getPrototypeOf(VsphereConnectClient)).call(this));

    _this.loggedIn = false;

    if (!_.isString(host) || _.isEmpty(host)) {
      throw new Error('missing required parameter "host"');
    }
    var opts = _.isObject(options) && !_.isArray(options) ? options : {};

    opts.cacheKey = _.isFunction(opts.cacheKey) ? opts.cacheKey : cacheKey$1;

    if (opts.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    _this._connection = soap.createClient('https://' + host + '/sdk/vimService.wsdl', opts).then(function (client) {
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

    return _ret = new v(_this), babelHelpers.possibleConstructorReturn(_this, _ret);
  }

  createClass(VsphereConnectClient, [{
    key: 'setSecurity',
    value: function setSecurity(securityObject) {
      this._soapClient.setSecurity(securityObject);
    }
  }, {
    key: 'create',
    value: function create(parent, type, config, options) {
      return methods$1.create.apply(this, [parent, type, config, options]);
    }
  }, {
    key: 'destroy',
    value: function destroy(moRef, options) {
      return methods$1.destroy.apply(this, [moRef, options]);
    }

    // alias for destroy

  }, {
    key: 'delete',
    value: function _delete(moRef, options) {
      return this.destroy(moRef, options);
    }
  }, {
    key: 'login',
    value: function login(identity, password) {
      return methods$1.login.apply(this, [identity, password]);
    }
  }, {
    key: 'logout',
    value: function logout() {
      return methods$1.logout.apply(this, []);
    }
  }, {
    key: 'method',
    value: function method(name, args) {
      return methods$1.method.apply(this, [name, args]);
    }
  }, {
    key: 'moRef',
    value: function moRef(inventoryPath) {
      return methods$1.moRef.apply(this, [inventoryPath]);
    }
  }, {
    key: 'reconfig',
    value: function reconfig(moRef, config, options) {
      return methods$1.reconfig.apply(this, [moRef, config, options]);
    }

    // alias for reconfig

  }, {
    key: 'update',
    value: function update(moRef, config, options) {
      return this.reconfig(moRef, config, options);
    }
  }, {
    key: 'reload',
    value: function reload(moRef) {
      return methods$1.reload.apply(this, [moRef]);
    }
  }, {
    key: 'rename',
    value: function rename(moRef, name, options) {
      return methods$1.rename.apply(this, [moRef, name, options]);
    }
  }, {
    key: 'retrieve',
    value: function retrieve(args, options) {
      return methods$1.retrieve.apply(this, [args, options]);
    }

    // alias for retrieve

  }, {
    key: 'find',
    value: function find(args, options) {
      return this.retrieve(args, options);
    }
  }]);
  return VsphereConnectClient;
}(EventEmitter);

var index = function (host, options) {
  return new VsphereConnectClient(host, options);
};

module.exports = index;
