export const specialisationModules = {
    'adv-electronics': {
      label: 'Advanced Electronics',
      core: ['EE3408C', 'EE3431C'], // required
      electives: {
        choose: 3, // choose 3
        from: ['EE4218', 'EE4407', 'EE4415', 'EE5507', 'CG3207', 'EE4409', 'EE4435', 'EE4436', 'EE4437', 'EE4438']
      }
    },

    'industry4': {
      label: 'Industry 4.0',
      core: [
        'EE3306/ME3163',  // ensure this kind of double coded modules dont cause trouble later on              
        ['EE3331C', 'ME2142/ME3142']     // core either or
      ],
      electives: {
        choose: 3,
        from: ['EE4211', 'EE4212', 'EE4302', 'EE4307', 'EE4311', 'EE4312', 'EE4314', 'EE4315', 'ME3242', 'ME4262', 'ME4248', 'ME4246', 'ME5405', 'CN4227R', 'CN4221R', 'RB4301']
      },

    'iot': {
      label: 'Internet of Things',
      core: ['CS3237', 'EE4211', 'EE4409'],
      electives: {
        choose: 2,
        from: ['CG4002', 'CS4222', 'EE4204', 'EE4216', 'EE4218','CS3244',
            ['EE4002D', 'EE4002R', 'CP4106'] //either one
        ]
      }
    },

    'microelectronics': {
      label: 'Microelectronics & Quantum Materials',
      core: ['EE2027', 'MLE2105'],
      electives: {
        choose: 3,
        from: ['EE3431C', 'EE4435', 'EE4437', 'EE4438', 'MLE3105', 'MLE4201',
            ['MLE4207', 'EE4436'], //either one
            'MLE4219', 'MLE4220', 'MLE4222',
            ['MLE4101B', 'EE4002D', 'EE4002R'] //either one
        ]
      }
    },
  //completed till here
    'robotics': {
      label: 'Robotics',
      core: ['EE2024', 'ME2142'],
      electives: {
        choose: 3,
        from: ['ME4243', 'EE4024', 'EE3001', 'ME4401', 'CS3242']
      }
    },

    'space-tech': {
        label: 'Space Technology',
        core: ['EE2024', 'ME2142'],
        electives: {
          choose: 3,
          from: ['ME4243', 'EE4024', 'EE3001', 'ME4401', 'CS3242']
        }
      },

      
  
    'data-eng': {
      label: 'Minor in Data Engineering',
      core: ['BT2101', 'ST2334'],
      electives: {
        choose: 2,
        from: ['DSA1101', 'CS2102', 'EE2211', 'IE2141', 'BT3103']
      }
    },
  

  }
}