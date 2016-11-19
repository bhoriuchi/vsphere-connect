import { graphSpec } from '../client/methods/retrieve'

let spec0 =   {
  type: 'vm',
  id: 'vm101'
}

let spec1 = {
  type: 'cluster',
  properties: ['name', 'summary']
}

let spec4 = {
  type: 'vm',
  id: ['vm102', 'vm103'],
  properties: ['name', 'summary.guest']
}

let spec5 = {
  type: 'folder',
  properties: ['name', 'guest']
}

let spec2 = [spec0]
let spec3 = [spec0, spec1, spec4, spec5]

let output = graphSpec(spec3)

console.log(JSON.stringify(output, null, '  '))