import { fetchModuleData } from './nusmodsApi';

async function test() {
  try {
    const data = await fetchModuleData('EE40002D');
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();