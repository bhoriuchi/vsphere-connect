import accessingVconnect from './accessing_vconnect/index'
import backendClient from './backend_client'
import selectingData from './selecting_data'
import objectManipulation from './object_manipulation'
import controlStructures from './control_structures'

export default [
  {
    section: 'Accessing vConnect',
    commands: accessingVconnect
  },
  {
    section: 'Backend Client',
    description: 'The following commands are used to access the backend client directly. ' +
    'They cannot directly be used in combination with any of the chained commands. To access the backend client use ' +
    'the <code>v.client</code> command.',
    commands: backendClient
  },
  {
    section: 'Selecting Data',
    commands: selectingData
  },
  {
    section: 'Object Manipulation',
    commands: objectManipulation
  },
  {
    section: 'Control Structures',
    commands: controlStructures
  }
]
