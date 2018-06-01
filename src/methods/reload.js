import Promise from 'bluebird';
import MoRef from '../common/moRef';

export default function reload(moRef) {
  try {
    return this.method('Reload', {
      _this: MoRef(moRef),
    }).then(() => {
      return { reload: true };
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
