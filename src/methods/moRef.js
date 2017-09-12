import Promise from 'bluebird'

export default function moRef (inventoryPath) {
  try {
    return this.method('FindByInventoryPath', {
      _this: this.serviceContent.searchIndex,
      inventoryPath
    })
  } catch (error) {
    return Promise.reject(error)
  }
}