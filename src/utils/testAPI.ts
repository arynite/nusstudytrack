import { fetchModuleData } from './nusmodsApi';

async function test() {
  try {
    const data = await fetchModuleData('PC2020');
    console.log(data);
    console.dir(data.prereqTree, {});
  } catch (error) {
    console.error('Error:', error);
  }
}

test();