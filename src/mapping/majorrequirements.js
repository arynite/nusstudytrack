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
        'EG3611A', // Required only if JC
        'EE1111A',
        'EE2111A',
        'EE2012',
        'EE2022',
        'EE2023',
        ['EE2026', 'EE2028'],
        'EE2027',
        'PC2020',
        'TE1', // Technical Elective 1
        'TE2', // Technical Elective 2
        'TC1', // Technical Complementary 1
        'TC2'  // Technical Complementary 2
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
        'GENXXXX',     // Communities and Engagement
        'GESSXXXX',    // Singapore Studies
        'GENXXXX'      // Culture and Connections
      ]
    }
  }
  