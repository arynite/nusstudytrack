import { generateTimetable } from './generateTimetable';
import { supabase } from './supabaseClient';

jest.mock('./supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
  }
}));

jest.mock('./shuffle', () => ({
  shuffleArray: jest.fn().mockImplementation(arr => [...arr])
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      semesterData: [{ semester: 1 }],
      prereqTree: null
    })
  })
) as jest.Mock;

describe('generateTimetable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("JEST TEST", async () => {
    (supabase.from('study_plans').select as jest.Mock).mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: { education: 'Polytechnic' },
          error: null
        })
      })
    });

    const result = await generateTimetable(
      ['ES1000', 'ES1103', 'MA1301', 'PC1201', 'EE1111A'], // modules
      2, // semesters
      5, // maxPerSemester
      '8c6d8133-6fe7-4a2b-9586-dd655807d870', // userId
      new Set(['GEA1000', 'GESS1025', 'GEC1015', 'GEN2050X']) // rcMods
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });
});