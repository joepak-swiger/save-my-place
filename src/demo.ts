import { Game } from './models';

export function makeDemoGames(): Game[] {
  const now = new Date();
  const older = new Date(now);
  older.setMonth(older.getMonth() - 6);

  return [
    {
      id: 'demo-ff7',
      title: 'FINAL FANTASY VII',
      platform: 'PS5',
      edition: 'Original / classic',
      addedAt: older.toISOString(),
      updatedAt: older.toISOString(),
      sessions: [
        {
          id: 'demo-session-1',
          createdAt: older.toISOString(),
          location: 'Heading toward Nibelheim',
          doing: 'Working through the story and checking enemies for useful skills/items.',
          nextObjective: 'Continue toward Nibelheim and check the next area before advancing too far.',
          dontForget: 'DO NOT SELL THE WEAPON WITH ENEMY SKILL.',
          partyBuild: 'Cloud / Tifa / Aerith',
          notes: 'This is demo data. Replace it with your own glorious bad decisions.',
          screenshots: [],
          checklist: [
            { id: 'demo-task-1', text: 'Restock Phoenix Downs', done: false },
            { id: 'demo-task-2', text: 'Check Enemy Skill setup', done: true }
          ]
        }
      ]
    },
    {
      id: 'demo-elden',
      title: 'ELDEN RING',
      platform: 'PC',
      addedAt: older.toISOString(),
      updatedAt: older.toISOString(),
      sessions: [
        {
          id: 'demo-session-2',
          createdAt: older.toISOString(),
          location: 'Caelid',
          doing: 'Exploring instead of following the main path because apparently I enjoy suffering.',
          nextObjective: 'Return to the grace near the road and head south.',
          dontForget: 'That giant bird is not worth it.',
          partyBuild: 'Dex build / Uchigatana',
          notes: '',
          screenshots: [],
          checklist: []
        }
      ]
    }
  ];
}
