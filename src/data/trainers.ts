export interface Trainer {
  id: number
  name: string
  title: string
  quote: string
  defeatQuote: string
  color: string
  teamIds: number[]
  difficulty: 1 | 2 | 3 | 4 | 5
}

export const TRAINERS: Trainer[] = [
  {
    id: 1,
    name: 'The Oracle',
    title: 'Seer of Delphi',
    quote: 'I have seen every possible outcome. None favour you.',
    defeatQuote: 'Impossible... this was not foretold.',
    color: '#7F77DD',
    teamIds: [5, 7, 20, 24, 31],
    difficulty: 1,
  },
  {
    id: 2,
    name: 'Lord of the Pit',
    title: 'Servant of Hades',
    quote: 'You cannot escape what lives in the dark.',
    defeatQuote: 'The darkness... retreats.',
    color: '#5A5A6E',
    teamIds: [4, 13, 16, 30, 47],
    difficulty: 2,
  },
  {
    id: 3,
    name: 'The War General',
    title: 'Champion of Ares',
    quote: 'Strategy is for the weak. Power wins everything.',
    defeatQuote: 'You fight... with honour. I respect that.',
    color: '#C84B31',
    teamIds: [6, 9, 10, 14, 33],
    difficulty: 3,
  },
  {
    id: 4,
    name: 'The Primordial',
    title: 'Voice of Chaos',
    quote: 'Before the gods, there was only us.',
    defeatQuote: 'Even chaos... can be tamed.',
    color: '#854F0B',
    teamIds: [18, 19, 15, 41, 48],
    difficulty: 4,
  },
  {
    id: 5,
    name: 'The Olympian',
    title: 'Favoured of the Gods',
    quote: 'Mount Olympus does not fall.',
    defeatQuote: 'The gods themselves... bow to you today.',
    color: '#c9922a',
    teamIds: [1, 3, 26, 43, 45],
    difficulty: 5,
  },
]
