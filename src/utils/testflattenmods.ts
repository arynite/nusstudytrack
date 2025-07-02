// testflattenmods.ts
import { eeMajorRequirements, specialisationModules } from './requirements'
import { flattenModules } from './flattenmodules'

const specialisations = ['robotics', 'iot'] // mock test inputs for specialisations
const flattened = flattenModules(eeMajorRequirements, specialisations, specialisationModules)
console.log(flattened)
