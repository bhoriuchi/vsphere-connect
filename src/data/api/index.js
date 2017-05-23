import accessingVconnect from './accessing_vconnect/index'
import writingData from './writing_data'
import backendClient from './backend_client'
import selectingData from './selecting_data'
import transformations from './transformations'
import aggregation from './aggregation'
import objectManipulation from './object_manipulation'
import mathAndLogic from './math_and_logic'
import controlStructures from './control_structures'

export default [
  {
    section: 'Accessing vConnect',
    commands: accessingVconnect
  },
  {
    section: 'Writing Data',
    commands: writingData
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
    section: 'Transformations',
    commands: transformations
  },
  {
    section: 'Aggregation',
    commands: aggregation
  },
  {
    section: 'Object Manipulation',
    commands: objectManipulation
  },
  {
    section: 'Math and logic',
    commands: mathAndLogic
  },
  {
    section: 'Control Structures',
    commands: controlStructures
  }
]
