function pickMods(mods, number) { // pick mods from mods list, GEs and UEs
  const result = [];
  for (let i = 0; i < number; i++) {
    const randomIndex = Math.floor(Math.random()*mods.length);
    result.push(mods[randomIndex]);
  }
  return result;
}


export const eeMajorRequirements = {
    label: 'Electrical Engineering Major',
  
    core: {
      label: 'Core Modules',
      required: [
        'DTK1234',
        'EG1311',
        'EE2211',
        'PF1101',
        ['EE4002D', 'EE4002R'],
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
        'EE3131C', // Technical Elective 1
        'EE3408C', // Technical Elective 2
        'EE3331C', // Technical Course 1
        'EE3431C'  // Technical Course 2
      ]
    },
  
    unrestrictedElectives: {
      label: 'Unrestricted Electives',
      note: 'Student must take sufficient UEMs to meet graduation MC requirements',
      choose: null // left flexible — will calculate based on total MCs taken


    },
  
    generalEducation: {
      label: 'General Education',
      required: [
        'GEA1000',     // Data Literacy
        'CS1010E',     // Digital Literacy
        'ES2631',      // Critique and Expression
        pickMods(['GEN2000', 'GEN2001','GEN2002' ], 1),  // Communities and Engagement
        pickMods(['GESS1000','GESS1001','GESS1002' ], 1),  // Singapore Studies
        pickMods(['GEC1000','GEC1001','GEC1002' ], 1)  // Culture and Connections
      ]
    },

    technicalElectives:{ // Number of TE depends on number of specialisations chosen
      label: 'Technical Electives',
      required: [
        pickMods([['EE3131C','EE3408C','EE3331C','EE3431C','EE3731C','EE3104C','EE4204','EE4205','EE4210','EE4211','EE4216',
    'CG3207','EE4407','EE4218','EE4415','EE4302','EE4307','EE4308','EE4311','EE4312','EE4314','EE4315','EE4705','EE4409',
    'EE4435','EE4436','EE4437','EE4438','EE4501','EE4502','EE4503','EE4505','EE4509','EE4511','EE4513','EE4212','EE4309',
    'EE4704','EE3105','EE4101','EE4104','EE4112','EE4115','EE3801','EE4032']], x) // value of x depends on the number of specialisations chosen
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
  }}

  const roboticsElectives = ['BN4203', 'BN4601', 'EE3305/ME3243', 'EE4305', 'EE4308', 'EE4309','EE4705', 'EE4311','EE4312', 'EE4314', 'ME4242', 'ME4245', 'ME5406', 'MLE4228', 'RB4301']

export const specialisationModules = {
  'adv-electronics': {
    label: 'Advanced Electronics',
    core: ['EE3408C', 'EE3431C'],
    electives: {
      choose: 3,
      from: ['EE4218', 'EE4407', 'EE4415', 'EE5507', 'CG3207', 'EE4409', 'EE4435', 'EE4436', 'EE4437', 'EE4438']
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
        'CG4002', 'CS4222', 'EE4204', 'EE4216', 'EE4218', 'CS3244',
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
    core: ['EE3801', ['IT2002', 'CS2102'], 'EE4802/IE4213', 'CS4225'],
    electives: {
      choose: 1,
      from: ['BT4015', 'EE4115', 'EE4704', 'EE5907', 'IE4210', 'IE4211', 'IE4243']
    }
  }
}
  