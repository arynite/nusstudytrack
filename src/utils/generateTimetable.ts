import { supabase } from './supabaseClient';

export async function getExemptedModules(userId: string): Promise<Set<string>> {
  if (!userId) return new Set();

  const { data, error } = await supabase
    .from('study_plans')
    .select('exemptions')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Supabase error fetching exemptions:', error);
    return new Set();
  }

  const exemptions: string[] = Array.isArray(data?.exemptions) ? data.exemptions : [];

  const bridgingModules = ['ES1000', 'ES1103', 'MA1301', 'PC1201'];
  if (exemptions.length === 0) {
    return new Set(bridgingModules);
  }

  const exemptionCodes = exemptions.map(mod => mod.split(' ')[0].trim());

  const completedModules = new Set<string>();
  for (const mod of bridgingModules) {
    if (exemptionCodes.includes(mod)) {
      completedModules.add(mod);
    }
  }
  console.log('Completed bridging modules:(test)', Array.from(completedModules));
  return completedModules;
}

export async function PolyOrNot(userId: string): Promise<Set<string>> {
  if (!userId) return new Set();

  const { data, error } = await supabase
    .from('study_plans')
    .select('education')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Supabase error fetching education:', error);
    return new Set();
  }

  const completedModules = await getExemptedModules(userId);
  const education = data?.education;

  if (education === 'Polytechnic') {
    ['EG3611P', 'EG1311', 'DTK1234'].forEach(mod => completedModules.add(mod));
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
  level: number;
}

type PrereqGroup = string[][];
  
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
      level: extractLevelFromModuleCode(moduleCode), // Extract year from module code
    }
  }

function getYearFromSemester(sem: number): number {
  return Math.floor(sem / 2) + 1;
}

function extractLevelFromModuleCode(code: string): number {
  const match = code.match(/\d+/); // Extract number part
  if (!match) return 1; // Default to Year 1 if no match

  const firstDigit = parseInt(match[0][0]);
  return Math.min(Math.max(firstDigit, 1), 5);
}

function parsePrerequisites(prereqTree: PrereqTree): PrereqGroup {
  if (!prereqTree) return [];

  if (typeof prereqTree === 'string') {
    return [[prereqTree.split(':')[0].trim()]];
  }

  if ('and' in prereqTree) {
    return prereqTree.and.flatMap(parsePrerequisites);
  }

  if ('or' in prereqTree) {
    const orGroup = prereqTree.or.flatMap(parsePrerequisites);
    return [orGroup.flat()];
  }

  if ('nOf' in prereqTree) {
    const [, mods] = prereqTree.nOf;
    return [mods.flatMap(parsePrerequisites).flat()];
  }
  return [];
}



  /**
   * @param modules list of module codes
   * @param semesters number of semesters
   * @param maxPerSemester maximum number of modules per semester
   * @param userId user ID to fetch exemptions
   * @return timetable as an array of arrays, each inner array represents a semester with module codes
   */


 export async function generateTimetable(
    modules: string[],  // array of module codes
    semesters: number,
    maxPerSemester: number,
    userId: string
  ): Promise<string[][]> { // fetch all module information in parallel
    console.log("generateTimetable - received userId:", userId);
    //const completedModules = await getExemptedModules(userId)
    const completedModules = await PolyOrNot(userId)
    console.log("Completed modules (Set):", Array.from(completedModules))
    modules = modules.filter(mod => !completedModules.has(mod)) // filter out exempted modules 
    const moduleInfos: Record<string, ModuleData> = {}; // to fetch module details from NUSMODs API
    await Promise.all(
      modules.map(async (mod) => {
        try {
          const info = await fetchModuleData(mod);
          info.level = extractLevelFromModuleCode(mod); // Extract year from module code
          moduleInfos[mod] = info; // Store module info
        } catch { // just skips the mod if fails to fetch
          moduleInfos[mod] = {
            moduleCode: mod,
            semesterData: [],
            prereqTree: null,
            level: extractLevelFromModuleCode(mod),
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

    const forcedSem0Mods = new Set(["ES1000", "ES1103", "MA1301", "CS1010E", "PC1201", "EE1111A"]);
    for (const mod of forcedSem0Mods) {
      if (modulesToSchedule.has(mod) && timetable[0].length < MAX_MODULES_PER_SEMESTER) {
        timetable[0].push(mod);
        completedModules.add(mod);
        modulesToSchedule.delete(mod);
      }}

    while (modulesToSchedule.size > 0 && progress) {  // Repeat until no modules left or no progress
      progress = false
      for (const mod of Array.from(modulesToSchedule)) { // checks for each unscheduled mod to see if they can be scheduled
        const info = moduleInfos[mod]
        const prereqs = parsePrerequisites(info.prereqTree) // Parse prerequisites

        const prereqsMet = prereqs.length === 0 || prereqs.some(group => group.some(pr => completedModules.has(pr))) // Check if prereqs are completed
        if (!prereqsMet) {
          const missing = prereqs.filter(group => !group.some(code => completedModules.has(code)));
          console.log(`Cannot place ${mod}, missing prereq group(s):`, missing);
          continue;
        }
  
        // Find earliest semester offered and with space
        let placed = false
        for (let sem = 0; sem < semesters; sem++) {
          //if (getYearFromSemester(sem) < info.level) continue; // see which level is the module 
          const moduleYear = info.level;
          const currentYear = getYearFromSemester(sem);
          if (currentYear + 1 < moduleYear) continue;
          
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

    return timetable
  }