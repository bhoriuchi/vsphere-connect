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
