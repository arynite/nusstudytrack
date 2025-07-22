import { fetchModuleData } from './nusmodsApi';

async function test() {
  try {
    const data = await fetchModuleData('EE2012');
    console.log(data);
    console.dir(data.prereqTree, {depth : null});
  } catch (error) {
    console.error('Error:', error);
  }
}

test()