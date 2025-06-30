

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
  
  /**
   * Recursively parse prereqTree to get all modules in an AND relation.
   * For OR, just pick the first option (simplified).
   */
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
  
  /**
   * Generates a semester-by-semester timetable for modules
   * respecting prerequisites and semester offerings.
   * @param modules list of module codes
   * @param semesters number of semesters (default 8)
   */
  export async function generateTimetable(
    modules: string[],
    semesters = 8
  ): Promise<string[][]> { // fetch all module information in parallel
    const moduleInfos: Record<string, ModuleData> = {}
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
  
    // Initialize empty timetable (array of semesters)
    const timetable: string[][] = Array.from({ length: semesters }, () => [])
  
    const completedModules = new Set<string>()
    let modulesToSchedule = new Set(modules)
  
    // Limit max modules per semester (adjust as needed)
    const MAX_MODULES_PER_SEMESTER = 5
  
    let progress = true
  
    // Repeat until no modules left or no progress
    while (modulesToSchedule.size > 0 && progress) {
      progress = false
  
      for (const mod of Array.from(modulesToSchedule)) {
        const info = moduleInfos[mod]
  
        // Parse prerequisites
        const prereqs = parsePrerequisites(info.prereqTree)
  
        // Check if prereqs are completed
        const prereqsMet = prereqs.every((pr) => completedModules.has(pr))
  
        if (!prereqsMet) continue
  
        // Find earliest semester offered and with space
        let placed = false
        for (let sem = 0; sem < semesters; sem++) {
          const offered = info.semesterData.some((s) => s.semester === sem + 1)
          if (offered && timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
            timetable[sem].push(mod)
            completedModules.add(mod)
            modulesToSchedule.delete(mod)
            progress = true
            placed = true
            break
          }
        }
  
        // If not placed because no semester offered or no space, skip this round
        if (!placed) continue
      }
    }
  
    // Return timetable array, each element = array of module codes for that semester
    return timetable
  }
  