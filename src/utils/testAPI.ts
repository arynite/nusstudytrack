import { fetchModuleData } from './nusmodsApi';

async function test() {
  try {
    const data = await fetchModuleData('CS1010E');
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();