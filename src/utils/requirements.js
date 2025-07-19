function pickMods(mods, number) { // pick mods from mods list
  const result = [];
  for (let i = 0; i < number; i++) {
    const randomIndex = Math.floor(Math.random()*mods.length);
    result.push(mods[randomIndex]);
  }
  return result;
}


export function eeMajorRequirements(z) { // consisits of core, unrestricted electives, technical electives, bridging modules
  return{
    label: 'Electrical Engineering Major',
    core: {
      label: 'Core Modules',
      required: [
        'CS1010E',
        'DTK1234',
        'EG1311',
        'EE2211',
        'PF1101',
        'EE4002D',
        'EE4002R',
        'MA1511',
        'MA1512',
        'MA1508E',
        'EG2401A',
        'EG3611A', // Required if JC
        'EE1111A',
        'EE2111A',
        'EE2012',
        'EE2022',
        'EE2023',
        ['EE2026', 'EE2028'],
        'EE2027',
        'PC2020',
        'EE3408C','EE3331C','EE3431C','EE3731C' // TE
      ]
    },
  
    unrestrictedElectives: {
      label: 'Unrestricted Electives',
      note: 'Student must take sufficient UEMs to meet graduation MC requirements',
      choose: null // left flexible — will calculate based on total MCs taken
    },

    technicalElectives:{ // Number of TE depends on number of specialisations chosen
      label: 'Technical Electives',
      required: [pickMods(['EE4204','EE4205','EE4210','EE4211','EE4216',
    'CG3207','EE4407','EE4218','EE4415','EE4302','EE4307','EE4308','EE4311','EE4312','EE4314','EE4315','EE4705','EE4409',
    'EE4435','EE4436','EE4437','EE4438','EE4501','EE4502','EE4503','EE4505','EE4509','EE4511','EE4513','EE4212','EE4309',
    'EE4704','EE3105','EE4101','EE4104','EE4112','EE4115','EE3801','EE4032'], z) // value of z depends on the number of specialisations and exemptions chosen
      ]
    },

    bridgingModules: {
      label: 'Bridging Modules',
      required:[
        'PC1201', // Physics
        'MA1301', // Mathematics
        'ES1103', // English
        'ES1000'  // Fundamental english
      ]
  },

    generalEducation: {
      label: 'General Education',
      required: [] // empty since handling GE in RCOrNoRC
    }
}}

  const roboticsElectives = ['BN4203', 'BN4601', 'EE3305', 'EE4305', 'EE4308', 'EE4309','EE4705', 'EE4311','EE4312', 'EE4314', 'ME4242', 'ME4245', 'ME5406', 'MLE4228', 'RB4301']


export const specialisationModules = {  // consists of SPN
  'adv-electronics': {
    label: 'Advanced Electronics',
    core: ['EE3408C', 'EE3431C'],
    electives: {
      choose: 3,
      from: ['EE4407', 'EE5507', 'EE4409', 'EE4435', 'EE4436', 'EE4437', 'EE4438']
    }
  },

  'industry4': {
    label: 'Industry 4.0',
    core: [
      'EE3306/ME3163',
      ['EE3331C', 'ME2142/ME3142']
    ],
    electives: {
      choose: 3,
      from: ['EE4211', 'EE4212', 'EE4302', 'EE4307', 'EE4311', 'EE4312', 'EE4314', 'EE4315', 'ME3242', 'ME4262', 'ME4248', 'ME4246', 'ME5405', 'CN4227R', 'CN4221R', 'RB4301']
    }
  },

  'iot': {
    label: 'Internet of Things',
    core: ['CS3237', 'EE4211', 'EE4409'],
    electives: {
      choose: 2,
      from: [
        'CS4222', 'EE4204', 'EE4216', 'EE4218', 'CS3244',
        ['EE4002D', 'EE4002R', 'CP4106']
      ]
    }
  },

  'microelectronics': {
    label: 'Microelectronics & Quantum Materials',
    core: ['EE2027', 'MLE2105'],
    electives: {
      choose: 3,
      from: [
        'EE3431C', 'EE4435', 'EE4437', 'EE4438', 'MLE3105', 'MLE4201',
        ['MLE4207', 'EE4436'],
        'MLE4219', 'MLE4220', 'MLE4222',
        ['MLE4101B', 'EE4002D', 'EE4002R']
      ]
    }
  },

  'robotics': {
    label: 'Robotics',
    electivesPool: roboticsElectives,
    paths: [
      {
        description: 'Complete 3 electives and a Capstone project in Robotics',
        capstone: {
          required: true,
          area: 'Robotics'
        },
        electives: {
          choose: 3
        }
      },
      {
        description: 'Complete 5 electives (no Capstone required)',
        capstone: {
          required: false
        },
        electives: {
          choose: 5
        }
      }
    ]
  },

  'space-tech': {
    label: 'Space Technology',
    core: ['EE3105', ['EE4002D', 'EE4002R']],
    electives: {
      choose: 2,
      from: ['EE3131C', 'EE3104C', 'EE3331C', 'EE4115', 'EE4218', 'EE4314', 'EE4503', 'EE4101']
    }
  },

  'transportation': {
    label: 'Sustainable Electric Transportation',
    core: ['EE4502', 'EE4503', 'EE4513'],
    electives: {
      choose: 2,
      from: ['EE4501', 'EE4505', 'EE4438', 'EE4511']
    }
  },

  'data-eng': {
    label: 'Minor in Data Engineering',
    core: ['EE3801', ['IT2002', 'CS2102'], 'EE4802', 'CS4225'],
    electives: {
      choose: 1,
      from: ['EE4115', 'EE4704', 'EE5907', 'IE4210', 'IE4211', 'IE4243']
    }
  }
}

export async function RCOrNoRC(userId, rcSelection) {

  const rc = rcSelection;
  const pickedMods = new Set();

  if (rc === 'None') {
    const geMods = [
      'GEA1000', 'CS1010E', 'ES2631',
      pickMods(['GEN2000', 'GEN2001', 'GEN2002'], 1),
      pickMods(['CDE2501', 'GESS1000', 'GESS1001', 'GESS1002'], 1),
      pickMods(['GEC1000', 'GEC1001', 'GEC1002'], 1)
    ];
    geMods.flat().forEach(mod => pickedMods.add(mod));
  }

  if (rc === 'Acacia') {
    const UTRC = pickMods(['UTW1001A', 'UTW1001C', 'UTW1001G', 'UTW1001I', 'UTW1001J', 'UTW1001K', 'UTW1001P', 'UTW1001Q', 'UTW1001T', 'UTW1001X'], 1);
    const Acacia_junior = pickMods(['UTC1801', 'UTC1802'], 1);
    const Acacia_senior = pickMods(['UTC2851', 'UTC2852', 'UTS2831', 'UTS2891'], 2);
    [UTRC, Acacia_junior, Acacia_senior].flat().forEach(mod => pickedMods.add(mod));
  }

  if (rc === 'CAPT') {
    const UTRC = pickMods(['UTW1001A', 'UTW1001C', 'UTW1001G', 'UTW1001I', 'UTW1001J', 'UTW1001K', 'UTW1001P', 'UTW1001Q', 'UTW1001T', 'UTW1001X'], 1);
    const CAPT_junior = pickMods(['UTC1409', 'UTC1416', 'UTC1412', 'UTC1422'], 1);
    const CAPT_senior = pickMods(['UTC2400', 'UTC2402', 'UTC2408', 'UTC2410B', 'UTC2411', 'UTC2412', 'UTC2417', 'UTC2420A', 'UTS2400', 'UTS2402', 'UTS2406', 'UTS2408', 'UTS2409', 'UTS2414'], 2);
    [UTRC, CAPT_junior, CAPT_senior].flat().forEach(mod => pickedMods.add(mod));
  }

  if (rc === 'RC4') {
    const UTRC = pickMods(['UTW1001A', 'UTW1001C', 'UTW1001G', 'UTW1001I', 'UTW1001J', 'UTW1001K', 'UTW1001P', 'UTW1001Q', 'UTW1001T', 'UTW1001X'], 1);
    const RC4_junior = pickMods(['UTC1702B', 'UTC1702C', 'UTC1702D', 'UTC1702E', 'UTC1702F', 'UTC1702G', 'UTC1702H'], 1);
    const RC4_senior = pickMods(['UTC2700', 'UTC2704', 'UTS2706', 'UTS2716', 'UTC2722', 'UTC2723', 'UTC2728', 'UTC2729', 'UTC2734', 'UTC2737'], 2);
    [UTRC, RC4_junior, RC4_senior].flat().forEach(mod => pickedMods.add(mod));
  }

  if (rc === 'Tembusu') {
    const UTRC = pickMods(['UTW1001A', 'UTW1001C', 'UTW1001G', 'UTW1001I', 'UTW1001J', 'UTW1001K', 'UTW1001P', 'UTW1001Q', 'UTW1001T', 'UTW1001X'], 1);
    const Tembu_junior = pickMods(['UTC1102C', 'UTC1102S', 'UTC1113', 'UTC1119'], 1);
    const Tembu_senior = pickMods(['UTC2105', 'UTC2107', 'UTC2110', 'UTC2113', 'UTC2114'], 2);
    [UTRC, Tembu_junior, Tembu_senior].flat().forEach(mod => pickedMods.add(mod));
  }

  if (rc === 'RVRC') {
    const rvc = pickMods(['RVC1000', 'RVC1001', 'RVC2000'], 1);
    const rvn = pickMods(['RVN2000', 'RVN2001', 'RVN2002', 'RVN2003'], 1);
    const rvss = pickMods(['RVSS1000', 'RVSS1001', 'RVSS1002', 'RVSS1003', 'RVSS1004'], 1);
    const rvx = pickMods(['RVX1000', 'RVX1002', 'RVX1003', 'RVX1005'], 1);
    [rvc, rvn, rvss, rvx].flat().forEach(mod => pickedMods.add(mod));
  }

  if (rc === 'NUSC') {
    pickedMods.add('GEA1000N');

    const NUSC_group1 = pickMods(['NTW2007','NTW2010','NTW2032','NTW2033','NTW2035','NTW2036','NTW2037','NTW2038',
      'NSW2001A','NSW2001B','NSW2001C','NSW2001D','NSW2001E','NSW2001F','NSW2001G','NSW2001H','NSW2001I','NSW2001J',
      'NPS2001A','NPS2001B','NPS2001C','NPS2001D','NPS2001E'], 2);
    const NUSC_group2 = pickMods(['NGN2001A','NGN2001B','NGN2001C','NGN2001D','NGN2001F','NGN2001G','NGN2001H','NGN2001I','NGN2001J','NGN2001K'], 1);
    const NUSC_group2_5 = pickMods(['NSS2001A','NSS2001B','NSS2001C','NSS2001D','NSS2001E','NSS2001F','NSS2001G','NSS2001H','NSS2001I','NSS2001J'], 1);
    const NUSC_group3 = pickMods(['NHS3901','NHS3902',
      'NST2044','NST3901','NST3902',
      'NHT2205','NHT2207','NHT2208','NHT2209','NHT2210','NHT2212','NHT2213'], 3);
    const NUSC_group4 = pickMods(['NEP3001', 'NEP3001Z'], 1);

    [NUSC_group1, NUSC_group2, NUSC_group2_5, NUSC_group3, NUSC_group4].flat().forEach(mod => pickedMods.add(mod));
  }

  return pickedMods;
}