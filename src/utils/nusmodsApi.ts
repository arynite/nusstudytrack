
const BASE_URL = 'https://api.nusmods.com/v2'

export async function fetchModuleData(code: string, year: string = '2024-2025') {
  const res = await fetch(`${BASE_URL}/${year}/modules/${code}.json`)
  if (!res.ok) throw new Error(`Failed to fetch module ${code}`)
  const data = await res.json()
  console.log(`Fetched module ${code}:`, data)
  return data
}

export async function fetchAllModules(codes: string[], year: string = '2024-2025') {
  const results: Record<string, any> = {}
  for (const code of codes) {
    try {
      results[code] = await fetchModuleData(code, year)
    } catch (err) {
      console.error('Failed to fetch', code, err)
    }
  }
  console.log(results)
  return results
}

fetchModuleData('CS1010E'); // test
fetchAllModules(['BN4203', 'BN4601', 'EE3305/ME3243', 'EE4305', 'EE4308', 'EE4309','EE4705', 'EE4311','EE4312', 'EE4314', 'ME4242', 'ME4245', 'ME5406', 'MLE4228', 'RB4301']); // test
