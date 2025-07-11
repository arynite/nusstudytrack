
type SemesterModule = {
    semester: number
  }
  
  type PrereqTree =
    | null
    | string
    | { type: 'and' | 'or'; data: PrereqTree[] }
  
  type ModuleData = {
    moduleCode: string
    semesterData: SemesterModule[]
    prereqTree: PrereqTree
  }

  const ProbabilityMatrix: number[][] = [
  [0.5, 0.4, 0.1, 0, 0, 0],
  [0.1, 0.2, 0.4, 0.2, 0.1, 0],
  [0, 0.05, 0.2, 0.4, 0.25, 0.1],
  [0, 0, 0, 0.1, 0.4, 0.5],
]

function getModuleYear(moduleCode: string): number {
  const match = moduleCode.match(/\d{4}/)
  if (!match) return 1
  const num = parseInt(match[0], 10)
  if (num >= 4000) return 4
  if (num >= 3000) return 3
  if (num >= 2000) return 2
  return 1
} 
  async function fetchModuleData(moduleCode: string): Promise<ModuleData> {
    const res = await fetch(
      `https://api.nusmods.com/v2/2023-2024/modules/${moduleCode}.json`
    )
    if (!res.ok) throw new Error(`Failed to fetch ${moduleCode}`)
    const data = await res.json()
    return {
      moduleCode,
      semesterData: data.semesterData || [],
      prereqTree: data.prereqTree || null,
    }
  }
  
  function parsePrerequisites(prereqTree: PrereqTree): string[] {
    if (!prereqTree) return []
    if (typeof prereqTree === 'string') return [prereqTree]
  
    if (prereqTree.type === 'and') {
      return prereqTree.data.flatMap(parsePrerequisites)
    }
    if (prereqTree.type === 'or') {
      // Simplified: just pick first option
      return parsePrerequisites(prereqTree.data[0])
    }
    return []
  }

  function Stochastic(semesters: number): number[] {
    const totalWeight = (semesters * (semesters + 1)) / 2;
    return Array.from({ length: semesters }, (_, i) => (semesters - i) / totalWeight);
  }
  
  function Prob(weights: number[]): number {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (r < sum) return i;
  }
  return weights.length - 1;
}

 export async function generateTimetable(
    modules: string[],  // array of module codes
    semesters: number,
    maxPerSemester: number
  ): Promise<string[][]> { // fetch all module information in parallel
    const moduleInfos: Record<string, ModuleData> = {}; // to fetch module details from NUSMODs API
   
    await Promise.all(
      modules.map(async (mod) => {
        try {moduleInfos[mod] = await fetchModuleData(mod)
        } catch { // just skips the mod if fails to fetch
          moduleInfos[mod] = {
            moduleCode: mod,
            semesterData: [],
            prereqTree: null,
          }
        }
      })
    )

    // Separate modules with and without prerequisites
    const [modulesWithPrereqs, modulesWithoutPrereqs] = modules.reduce(
      ([withPrereqs, withoutPrereqs], mod) => {
      const prereqs = parsePrerequisites(moduleInfos[mod].prereqTree);
      return prereqs.length > 0
        ? [[...withPrereqs, mod], withoutPrereqs]
        : [withPrereqs, [...withoutPrereqs, mod]];
    }, [[], []] as [string[], string[]]);
  
    // Initialize empty timetable (array of semesters)
    const timetable: string[][] = Array.from({ length: semesters }, () => [])
    const completedModules = new Set<string>() // check if modules are completed
    const MAX_MODULES_PER_SEMESTER = maxPerSemester
    let modulesToSchedule = new Set(modulesWithPrereqs) // modules that have prerequisites
    let progress = true
  
    // Repeat until no modules left or no progress
    while (modulesToSchedule.size > 0 && progress) {
      progress = false
  
      for (const mod of Array.from(modulesToSchedule)) { // checks for each unscheduled mod to see if they can be scheduled
        const info = moduleInfos[mod]
  
        // Parse prerequisites
        const prereqs = parsePrerequisites(info.prereqTree)
  
        // Check if prereqs are completed
        const prereqsMet = prereqs.every((pr) => completedModules.has(pr))
        if (!prereqsMet) continue
  
        // Find earliest semester offered and with space
        for (let sem = 0; sem < semesters; sem++) {
          const offered = info.semesterData.some((s) => s.semester === sem + 1)
          if (offered && timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
            timetable[sem].push(mod)
            completedModules.add(mod)
            modulesToSchedule.delete(mod)
            progress = true
            break
          }
        }
      }
    }

  const NoPreReq = Stochastic(semesters)
    
  for (const mod of modulesWithoutPrereqs) {
    const info = moduleInfos[mod];
    let placed = false;

    for (let attempt = 0; attempt < semesters * 2; attempt++) {
      const sem = Prob(NoPreReq);
      const offered =
        info.semesterData.length === 0 ||
        info.semesterData.some((s) => s.semester === sem + 1);

      if (offered && timetable[sem].length < maxPerSemester) {
        timetable[sem].push(mod);
        placed = true;
        break;
      }
    }

    // Fallback if not placed randomly
    if (!placed) {
      for (let sem = 0; sem < semesters; sem++) {
        if (timetable[sem].length < maxPerSemester) {
          timetable[sem].push(mod);
          break;
        }
      }
    }
  }

    const remainingModules = Array.from(modulesToSchedule)

    remainingModules.sort((a, b) => {
      const aInfo = parseInt(a.match(/\d+/)?.[0] || '1000')
      const bInfo = parseInt(b.match(/\d+/)?.[0] || '1000')
      return aInfo - bInfo
    })

    for (const mod of remainingModules) {
      const info = moduleInfos[mod];
    
    // Try to place in latest possible semester that has space
    let placed = false;
    for (let sem = semesters - 1; sem >= 0; sem--) {
      const offered = info.semesterData.length === 0 || 
      info.semesterData.some((s) => s.semester === sem + 1);
      
      if (offered && timetable[sem].length < maxPerSemester) {
        timetable[sem].push(mod);
        placed = true;
        break;
      }
    }
    
    // If not placed, put in first available semester
    if (!placed) {
      for (let sem = 0; sem < semesters; sem++) {
        if (timetable[sem].length < maxPerSemester) {
          timetable[sem].push(mod);
          break;
        }
      }
    }
  }

    return timetable
  }
  
  // generate using stochastic matrix? 