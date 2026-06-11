
const fs = require('fs');
let code = fs.readFileSync('src/components/athlete/AthleteViews.tsx', 'utf8');

// Remove the default export wrapper completely.
// We keep the API imports and the internal components.
code = code.replace(/export default function AthleteView\([^}]+\{[^]*?(?=\/\/ --- Overview)/s, '');

// Rename internal components to export them
code = code.replace(/function OverviewTab/g, 'export function AthleteOverview');
code = code.replace(/function AthleteRegistration/g, 'export function AthleteRegistration');
code = code.replace(/function AthleteProfile/g, 'export function AthleteProfile');
code = code.replace(/function RankingTable/g, 'export function AthleteRanking');
code = code.replace(/function FormField/g, 'export function FormField');

// Add a hook for fetching 'me' since App.tsx won't have it natively
const useMeHook = \
export function useAthleteProfile(userId: number | string) {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;
    peopleApi.listPlayers({ userId }).then(res => {
      if (res.data && res.data.length > 0) {
        const p = res.data[0]
        setMe({
          name: p.name,
          id: p.code || String(p.id),
          dbId: p.id,
          club: p.club_name || 'T? do',
          tier: p.tier || 'C',
          rating: p.rating || 1000,
          dob: p.dob || '2000-01-01',
          cccd: p.cccd || '',
          photoUrl: p.photo_url || '',
          clubId: p.club_id
        })
      } else {
        setMe({ name: 'VÐV M?i', id: \\\U-\\\\\\, dbId: null, club: 'Chua có', tier: '-', rating: 0, dob: '2000' })
      }
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [userId])

  return { me, loading }
}

\;

code = useMeHook + code;

// Ensure imports have useState, useEffect
if (!code.includes('import React, { useState, useEffect }')) {
    code = 'import React, { useState, useEffect } from \\'react\\';\n' + code;
}

fs.writeFileSync('src/components/athlete/AthleteViews.tsx', code);
console.log('Done rewriting AthleteViews');

