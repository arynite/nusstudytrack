import { supabase } from './supabaseClient';
import { shuffleArray } from './shuffle';

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

  const bridgingModules_And_Math = ['ES1000', 'ES1103', 'MA1301', 'PC1201', 'CS1010E', 'MA1511', 'MA1512'];
  if (exemptions.length === 0) {
    return new Set(bridgingModules_And_Math);
  }

  const exemptionCodes = exemptions.map(mod => mod.split(' ')[0].trim());

  const completedModules = new Set<string>();
  for (const mod of bridgingModules_And_Math) {
    if (exemptionCodes.includes(mod)) {
      completedModules.add(mod);
    }
  }
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

  if (education === 'Polytechnic') { // in addition to -5 for x
    ['EG3611P', 'EG1311', 'DTK1234', 'EG3611A'].forEach(mod => completedModules.add(mod));
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
      `https://api.nusmods.com/v2/2024-2025/modules/${moduleCode}.json` // changed from 2023-2024 to 2024-2025
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
    userId: string,
    rcMods: Set<string> = new Set() /////////////////////////////////////////////
  ): Promise<string[][]> { // fetch all module information in parallel

    const allModules = [...new Set([...modules, ...rcMods])];

    //const completedModules = await getExemptedModules(userId)
    const completedModules = await PolyOrNot(userId)

    //modules = modules.filter(mod => !completedModules.has(mod)) // filter out exempted modules 
    modules = shuffleArray(allModules.filter(mod => !completedModules.has(mod)));

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

     const needsES1000 = modulesToSchedule.has("ES1000"); //ensure es1000 and es1103 are not in the same sem
     const needsES1103 = modulesToSchedule.has("ES1103");
 
     if (needsES1000 && timetable[0].length < MAX_MODULES_PER_SEMESTER) {
       timetable[0].push("ES1000");
       completedModules.add("ES1000");
       modulesToSchedule.delete("ES1000");
 
       if (needsES1103 && semesters > 1 && timetable[1].length < MAX_MODULES_PER_SEMESTER) {
         timetable[1].push("ES1103");
         completedModules.add("ES1103");
         modulesToSchedule.delete("ES1103");
       }
     } else if (needsES1103 && timetable[0].length < MAX_MODULES_PER_SEMESTER) {
       timetable[0].push("ES1103");
       completedModules.add("ES1103");
       modulesToSchedule.delete("ES1103");
     }
 
     // Handle the rest of the fixed semester 1 modules
     const forcedSem0Mods = new Set(["MA1301", "CS1010E", "PC1201", "EE1111A"]);
     for (const mod of forcedSem0Mods) {
       if (modulesToSchedule.has(mod) && timetable[0].length < MAX_MODULES_PER_SEMESTER) {
         timetable[0].push(mod);
         completedModules.add(mod);
         modulesToSchedule.delete(mod);
       }
     }
    
      if (modulesToSchedule.has("EE2111A") && semesters > 1) { //ensure EE2111A always in y1s2
        if (timetable[1].length < MAX_MODULES_PER_SEMESTER) {
          timetable[1].push("EE2111A");
          completedModules.add("EE2111A");
          modulesToSchedule.delete("EE2111A");
        }
      }

      if (modulesToSchedule.has("GEA1000")) { //ensure gea is completed within first year 
        for (let sem = 0; sem < Math.min(2, semesters); sem++) {
          if (timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
            timetable[sem].push("GEA1000");
            completedModules.add("GEA1000");
            modulesToSchedule.delete("GEA1000");
            break;
          }
        }
      }

      if (modulesToSchedule.has("MA1511")) { //ensure MA1511 is completed within first year 
        for (let sem = 0; sem < Math.min(2, semesters); sem++) {
          if (timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
            timetable[sem].push("MA1511");
            completedModules.add("MA1511");
            modulesToSchedule.delete("MA1511");
            break;
          }
        }
      }

      if (modulesToSchedule.has("MA1512")) { //ensure MA1512 is completed within first year 
        for (let sem = 0; sem < Math.min(2, semesters); sem++) {
          if (timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
            timetable[sem].push("MA1512");
            completedModules.add("MA1512");
            modulesToSchedule.delete("MA1512");
            break;
          }
        }
      }

    const NUSC_NHTMods_and_Others = new Set(["NHT2205","NHT2207","NHT2208","NHT2209","NHT2210","NHT2212","NHT2213",
      "EE2211", "CS3237", "IT2002", "PC2020", "EE4407", "EE3408C", "EE2023", "EE4409", "EE2012", "EE3104C", "EE3731C",
      "UTC2110","UTC2105", "UTC2737", "UTC2729", "EE3331C", "EE3131C", "NSS2001H", "NPS2001C", "EE4211", "EE4502", "EE3801",
      "EE4438", "EE5507", "EE4204", "EE4210", "EE4212", "EE4437", "EE5507", "EE4307", "EE4302", "EE4503", "CS4222", " CS4225",
      ""
    ]);


    while (modulesToSchedule.size > 0 && progress) {  // Repeat until no modules left or no progress
      progress = false
      for (const mod of shuffleArray(Array.from(modulesToSchedule))) { // checks for each unscheduled mod to see if they can be scheduled
        const info = moduleInfos[mod]
        const prereqs = parsePrerequisites(info.prereqTree) // Parse prerequisites

        //const prereqsMet = prereqs.length === 0 || prereqs.some(group => group.some(pr => completedModules.has(pr))) // Check if prereqs are completed

        let prereqsMet;
        if (NUSC_NHTMods_and_Others.has(mod)) {
          // For NUSC/NHT modules, we trust prerequisites are fulfilled
          prereqsMet = true;
        } else {
          prereqsMet =
            prereqs.length === 0 || prereqs.some(group => group.some(pr => completedModules.has(pr)));
        }


        if (!prereqsMet) { // if not met, skip this module, (besides certain NUSC mods due to their unique prerequistes like NHT courses)
          const missing = prereqs.filter(group => !group.some(code => completedModules.has(code)));
          console.log(`Cannot place ${mod}, missing prereq group(s):`, missing);
          continue;
        }
        // NHT Courses:  && (mod !== "NHT2205" || "NHT2207"|| "NHT2208"|| "NHT2209"|| "NHT2210"|| "NHT2212" || "NHT2213")

        const isitFinalYearMod = info.level >= 4;
        const last2Sems = semesters >= 2? [semesters -2, semesters -1] : [semesters -1];

        if (isitFinalYearMod) {
          for (const lastsems of last2Sems) {
            if (timetable[lastsems].length < MAX_MODULES_PER_SEMESTER){
              timetable[lastsems].push(mod);
              completedModules.add(mod);
              modulesToSchedule.delete(mod);
              progress = true;
            break;
          }
        }
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