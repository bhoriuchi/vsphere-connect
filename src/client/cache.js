import _ from 'lodash'
import path from 'path'
import fs from 'fs'

export const BASE_DIR = path.resolve(__dirname.replace(/^(.*\/vsphere-connect)(.*)$/, '$1'))
export const CACHE_DIR = path.resolve(`${BASE_DIR}/.wsdlCache`)

export function getCache (wsdl) {
  let entry = _.last(wsdl.split('/'))
  let wsdls = JSON.parse(fs.readFileSync(`${CACHE_DIR}/wsdls.json`))
  let wsdlPath = _.get(wsdls.endpoints, wsdl)
  return wsdlPath ? path.resolve(`${CACHE_DIR}/${wsdlPath}/${entry}`) : null
}

export function setCache (WSDL_CACHE, wsdl, apiVersion) {
  let API_DIR = `${CACHE_DIR}/${apiVersion}`
  let wsdls = JSON.parse(fs.readFileSync(`${CACHE_DIR}/wsdls.json`))

  if (!_.includes(wsdls.apiVersions, apiVersion)) {
    if (!fs.existsSync(API_DIR)) fs.mkdirSync(API_DIR)
    _.forEach(WSDL_CACHE, (cache, uri) => {
      let fileName = _.last(uri.split('/'))
      fs.writeFileSync(`${API_DIR}/${fileName}`, cache.content)
    })
    wsdls.apiVersions.push(apiVersion)
  }
  wsdls.endpoints[wsdl] = apiVersion
  fs.writeFileSync(`${CACHE_DIR}/wsdls.json`, JSON.stringify(wsdls, null, '  '))
}