import _ from 'lodash';

export default class SpecProxy {
  constructor(client, type, spec, options) {
    this.client = client;
    this.options = options;
    this.wsdl = client._soapClient.wsdl;
    this.typeCoord = _.isArray(type)
      ? type
      : this.wsdl.getTypeByQName(`vim25:${type}`);
    this.type = this.wsdl.getType(this.typeCoord);

    this.config = {};

    if (_.isFunction(spec)) {
      const p = new Proxy(this.config, {
        get: (target, property) => {
          const prop = _.find(this.type.elements, e => {
            return _.toLower(e.name) === _.toLower(property);
          });

          if (!prop) {
            return () => {
              return p;
            };
          }

          return value => {
            if (this.wsdl.isMany(prop)) {
              if (_.isArray(target[prop.name])) target[prop.name] = [];
              if (this.wsdl.isSimpleType(prop.type)) {
                target[prop.name].push(value);
              } else {
                this.getChildTypes(prop.type);
                target[prop.name].push(
                  new SpecProxy(this.client, prop.type, value, this.options)
                    .spec,
                );
              }
            } else if (this.wsdl.isSimpleType(prop.type)) {
              target[prop.name] = value;
            } else {
              this.getChildTypes(prop.type);
              target[prop.name] = new SpecProxy(
                this.client,
                prop.type,
                value,
                this.options,
              ).spec;
            }

            return p;
          };
        },
      });
      spec(p);
    } else {
      this.config = spec;
    }
  }

  getChildTypes(typeCoords, children = []) {
    const [ns, type] = typeCoords;
    const ext = _.filter(_.get(this.wsdl.metadata, `types[${ns}]`), t => {
      return _.get(t, 'base[0]') === ns && _.get(t, 'base[1]') === type;
    });

    // TODO: implement this - just to pass lint for now
    _.noop(children, ext);
  }

  get spec() {
    return this.config;
  }
}
