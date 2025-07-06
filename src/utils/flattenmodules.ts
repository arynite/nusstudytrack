// takes graduation requirements from requirements.js
// takes user inputs like specialisations
// outputs a list of mods that are required for graduation

import { eeMajorRequirements, specialisationModules } from './requirements'

export function flattenModules(
  major: typeof eeMajorRequirements,
  specialisations: string[],
  specialisationModulesData: typeof specialisationModules,
  selectedExemptions: string[] = [],
): string[] {
  const modulesSet = new Set<string>() // a set to create course codes

  major.core.required.forEach((mod) => {
    if (Array.isArray(mod)) { // loops through core mods, will choose core mods first
      modulesSet.add(mod[0])
    } else { // or else it will just add the mod directly
      modulesSet.add(mod)
    }
  })

  major.generalEducation.required.forEach((mod) => {
    if (Array.isArray(mod)) { // loops through GE mods, will choose GE mods first
      modulesSet.add(mod[0])
    } else { // or else it will just add the mod directly
      modulesSet.add(mod)
    }
  })

  major.bridgingModules.required.forEach((mod) => {
    if (!selectedExemptions.includes(mod)) {
      modulesSet.add(mod)
    }})
    

  specialisations.forEach((spec) => {
    const specData = specialisationModulesData[spec]
    if (!specData) return // skip if users didnt choose this specialisation

    if (specData.core) { 
      specData.core.forEach((mod) => {
        if (Array.isArray(mod)) {
          modulesSet.add(mod[0]) // picks core mods for specialisaiton first
        } else {
          modulesSet.add(mod)
        }
      })
    }

    if (specData.electives) {
      const count = specData.electives.choose || 0
      const fromList = specData.electives.from || []
      for (let i = 0; i < count && i < fromList.length; i++) {
        const mod = fromList[i]
        if (Array.isArray(mod)) {
          modulesSet.add(mod[0])
        } else {
          modulesSet.add(mod)
        }
      }
    } else if (specData.electivesPool && specData.paths) {
      const firstPath = specData.paths[0]
      if (firstPath && firstPath.electives) {
        const count = firstPath.electives.choose || 0
        for (let i = 0; i < count && i < specData.electivesPool.length; i++) {
          modulesSet.add(specData.electivesPool[i])
        }
      }
    }
  })

  return Array.from(modulesSet)
}
