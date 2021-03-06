import _ from 'lodash';
import Promise from 'bluebird';
import mo from '../common/mo';
import ObjectSpec from './ObjectSpec';
import PropertySpec from './PropertySpec';

export class PropertyFilterSpec {
  constructor(obj, client) {
    this.obj = obj;
    this.client = client;
  }
  get spec() {
    let [type, container, recursive] = [null, null, null];
    let resolveView = Promise.resolve(null);
    const viewManager = this.client.serviceContent.viewManager;

    if (!this.obj.id.length) {
      type = this.obj.type;
      container = this.client.serviceContent.rootFolder;
      recursive = true;
    } else if (!this.obj.type) {
      return Promise.reject('Missing required argument "type"');
    }

    type = type || this.obj.type;
    container =
      container || this.obj.container || this.client.serviceContent.rootFolder;
    recursive = this.obj.recursive !== false;
    const listSpec = _.get(
      mo,
      `["${this.client.apiVersion}"]["${type}"].listSpec`,
    );
    if (!listSpec && !this.obj.id.length) {
      return Promise.reject(
        'Unable to list vSphere type, ' + 'try with a specific object id',
      );
    }

    // get the container view if no object specified
    // this is used for listing entire collections of object types
    if (!this.obj.id.length && listSpec.type === 'ContainerView') {
      resolveView = this.client.method('CreateContainerView', {
        _this: viewManager,
        container,
        type,
        recursive,
      });
    }

    return resolveView.then(containerView => {
      this.obj.containerView = containerView;
      this.obj.listSpec = listSpec;

      const objectSet = ObjectSpec(this.obj).spec;
      const propSet = [PropertySpec(this.obj).spec];
      return { objectSet, propSet };
    });
  }
}

export default function(obj, client) {
  return new PropertyFilterSpec(obj, client);
}
