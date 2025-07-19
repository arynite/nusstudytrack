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

function extractLevelFromModuleCode(code: string | undefined): number {
  if (!code || typeof code !== 'string') return 1; 

  const match = code.match(/\d+/);
  if (!match) return 1;

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
    rcMods: Set<string> = new Set()
  ): Promise<string[][]> { // fetch all module information in parallel

    const allModules = [...new Set([...modules, ...rcMods])];
    const completedModules = await PolyOrNot(userId)

    modules = shuffleArray(
      allModules.filter(mod => typeof mod === 'string' && !completedModules.has(mod))
    );
    console.log("Modules after filtering completed ones:", modules);

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

    // Separate modules with and without prerequisites, modulesWithPrereqs, modulesWithoutPrereqs
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

      if (modulesToSchedule.has("DTK1234")) { //ensure DTK1234 is completed within first year 
        for (let sem = 0; sem < Math.min(2, semesters); sem++) {
          if (timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
            timetable[sem].push("DTK1234");
            completedModules.add("DTK1234");
            modulesToSchedule.delete("DTK1234");
            break;
          }
        }
      }

    const NUSC_NHTMods_and_Others = new Set(["NHT2205","NHT2207","NHT2208","NHT2209","NHT2210","NHT2212","NHT2213",
      'NPS2001A','NPS2001B','NPS2001C','NPS2001D','NPS2001E',
      'UTC2851', 'UTC2852', 'UTS2831', 'UTS2891',
      'UTC2400', 'UTC2402', 'UTC2408', 'UTC2410B', 'UTC2411', 'UTC2412', 'UTC2417', 'UTC2420A', 'UTS2400', 'UTS2402', 'UTS2406', 'UTS2408', 'UTS2409', 'UTS2414',
      'UTC2700', 'UTC2704', 'UTS2706', 'UTS2716', 'UTC2722', 'UTC2723', 'UTC2728', 'UTC2729', 'UTC2734', 'UTC2737',
      'UTC2105', 'UTC2107', 'UTC2110', 'UTC2113', 'UTC2114',
      'NSS2001A','NSS2001B','NSS2001C','NSS2001D','NSS2001E','NSS2001F','NSS2001G','NSS2001H','NSS2001I','NSS2001J',
      "EE2211","EE4407", "EE3408C", "EE2023", "EE4409", "EE2012", "EE3104C", "EE3731C",
      "EE3331C", "EE3131C", "EE4211", "EE4502", "EE3801",
      "EE4438", "EE5507", "EE4204", "EE4210", "EE4212", "EE4437", "EE5507", "EE4307", "EE4302", "EE4503", 
      "EE4101", "EE4435", "EE4802", 
      "CG3207", "CS4222", "CS4225", "CS3237", "IT2002",
      "PC2020", 
    ]);

    let selectedYearLongMod: string | null = null;

    if (modulesToSchedule.has('EE4002R')) {
      selectedYearLongMod = 'EE4002R';
      modulesToSchedule.delete('EE4002D');
    } else if (modulesToSchedule.has('EE4002D')) {
      selectedYearLongMod = 'EE4002D';
      modulesToSchedule.delete('EE4002R');
    }
    
    if (selectedYearLongMod) {
      let placed = false;
      const startIdx = Math.max(0, timetable.length - 3); // e.g. 5 if timetable has 8
      const endIdx = timetable.length - 2; // stop at second last to allow [i] and [i+1]
    
      for (let i = startIdx; i <= endIdx; i++) {
        if (
          timetable[i].length < MAX_MODULES_PER_SEMESTER &&
          timetable[i + 1].length < MAX_MODULES_PER_SEMESTER
        ) {
          timetable[i].push(selectedYearLongMod);
          timetable[i + 1].push(selectedYearLongMod);
          completedModules.add(selectedYearLongMod);
          modulesToSchedule.delete(selectedYearLongMod);
          placed = true;
          break;
        }
      }
    
      if (!placed) {
        console.warn(
          `Unable to place ${selectedYearLongMod} across 2 consecutive semesters — not enough space.`
        );
      }
    }

    const last2Sems = semesters >= 4 ? [semesters -4, semesters - 3,semesters - 2, semesters - 1] : Array.from({length: semesters}, (_, a) => a);
    progress = true;
    while (modulesToSchedule.size > 0 && progress) {  // Repeat until no modules left or no progress
      progress = false;


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
    
    function thoselastfewmods(
      timetable: string[][],
      modulesToSchedule: Set<string>,
      MAX_MODULES_PER_SEMESTER: number
    ) {
      for (const mod of Array.from(modulesToSchedule)) {
        for (let sem = 0; sem < timetable.length; sem++) {
          if (timetable[sem].length < MAX_MODULES_PER_SEMESTER) {
          timetable[sem].push(mod);
          modulesToSchedule.delete(mod);
          break;
        }
      }
    }
  }

    thoselastfewmods(timetable, modulesToSchedule, MAX_MODULES_PER_SEMESTER);
    return timetable
  }