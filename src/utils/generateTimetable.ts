import { supabase } from './supabaseClient';

export async function getExemptedModulesFromLoggedInUser(): Promise<Set<string>> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('user data:', userData);
  console.log('user error:', userError);

  const userId = userData.user?.id;
  console.log('userId:', userId);

  if (!userId) {
    console.error('No user ID');
    return new Set();
  }

  return await getExemptedModules(userId);
}

export async function getExemptedModules(userId: string): Promise<Set<string>> {
  const { data, error, status } = await supabase
    .from('study_plans')
    .select('exemptions')
    .eq('user_id', userId)
    .single();

  console.log('from Supabase:', { data, error, status });

  const completedModules = new Set<string>();

  for (const mod of data?.exemptions ?? []) {
    const code = mod.split(' ')[0].trim();
    completedModules.add(code);
  }

  return completedModules;
}


type SemesterModule = {
    semester: number
  }

type PrereqTree =
  | string
  | { and?: PrereqTree[]; or?: PrereqTree[]; nOf?: [number, PrereqTree[]] } // added n0f for AND prerequisites

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

function parsePrerequisites(prereqTree: PrereqTree): string[] {
  if (!prereqTree) return [];
  if (typeof prereqTree === 'string') return [prereqTree];
  if ('and' in prereqTree) {
    return prereqTree.and.flatMap(parsePrerequisites);
  }
  if ('or' in prereqTree) {
    return prereqTree.or.flatMap(parsePrerequisites);
  }

  if ('nOf' in prereqTree) {
    const [, mods] = prereqTree.nOf;
    return mods.flatMap(parsePrerequisites);
  }
  return [];
}

  /**
   * @param modules list of module codes
   * @param semesters number of semesters 
   */
 export async function generateTimetable(
    modules: string[],  // array of module codes
    semesters: number,
    maxPerSemester: number,
    userId: string
  ): Promise<string[][]> { // fetch all module information in parallel
    const completedModules = await getExemptedModules(userId)
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

    //// Separate modules with and without prerequisites, modulesWithPrereqs, modulesWithoutPrereqs
    const [modulesWithPrereqs, modulesWithoutPrereqs] = modules.reduce(
      ([withPrereqs, withoutPrereqs], mod) => {
      const prereqs = parsePrerequisites(moduleInfos[mod].prereqTree);
      return prereqs.length > 0
        ? [[...withPrereqs, mod], withoutPrereqs]
        : [withPrereqs, [...withoutPrereqs, mod]]; }, [[], []] as [string[], string[]]);

    console.log("with prereq:", modulesWithPrereqs);
    console.log("without prereq", modulesWithoutPrereqs);


  
    // Initialize empty timetable (array of semesters)
    const timetable: string[][] = Array.from({ length: semesters }, () => [])
    //const completedModules = new Set<string>() // check if modules are completed
    let modulesToSchedule = new Set(modules) // modules that need to be scheduled
    const MAX_MODULES_PER_SEMESTER = maxPerSemester
    let progress = true
  
    while (modulesToSchedule.size > 0 && progress) {  // Repeat until no modules left or no progress
      progress = false
      for (const mod of Array.from(modulesToSchedule)) { // checks for each unscheduled mod to see if they can be scheduled
        const info = moduleInfos[mod]
        const prereqs = parsePrerequisites(info.prereqTree) // Parse prerequisites
        const prereqsMet = prereqs.every((pr) => completedModules.has(pr)) // Check if prereqs are completed
        if (!prereqsMet) continue
  
        // Find earliest semester offered and with space
        let placed = false
        for (let sem = 0; sem < semesters; sem++) {
          //const offered = info.semesterData.some((s) => s.semester === sem + 1) // check for offered in semester
          if (timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
            timetable[sem].push(mod)
            completedModules.add(mod)
            modulesToSchedule.delete(mod)
            progress = true
            placed = true
            break
          }
        }
        if (!placed) continue
      }
    }

    /*
    for (const mod of modulesToSchedule) { // just place down those that are left
      for (let sem = 0; sem < semesters; sem++) {
        if (timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
          timetable[sem].push(mod)
          break}}}
          */

    return timetable    // return array
  }