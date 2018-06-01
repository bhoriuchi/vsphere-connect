import path from 'path';
import LocalStorage from 'node-localstorage';

const BASE_DIR = __dirname.replace(/^(.*\/soap-connect)(.*)$/, '$1');
const STORAGE_PATH = path.resolve(`${BASE_DIR}/.localStorage`);
const store = new LocalStorage.LocalStorage(STORAGE_PATH);

export { STORAGE_PATH };
export { store };

export function set(k, value) {
  return store.setItem(k, value);
}

export function get(k) {
  return store.getItem(k);
}

export function length() {
  return store.length;
}

export function remove(k) {
  return store.removeItem(k);
}

export function key(n) {
  return store.key(n);
}

export function clear() {
  return store.clear();
}

export default {
  STORAGE_PATH,
  store,
  set,
  get,
  length,
  remove,
  key,
  clear,
};
