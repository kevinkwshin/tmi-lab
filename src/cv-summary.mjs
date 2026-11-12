// Shared website summaries of the same editable grants used in the CV.
export function grantSummaries(lang, grants = []) {
  const roles = {
    ko: {PI: '연구책임자 (PI)', 'Co-I': '공동연구자 (Co-I)', PM: '과제관리자 (PM)', Collaborator: '참여연구자'},
    en: {PI: 'Principal Investigator', 'Co-I': 'Co-Investigator', PM: 'Project Manager', Collaborator: 'Collaborator'},
  };
  return [...grants].sort((a, b) => b.start.localeCompare(a.start)).map(grant => ({
    title: lang === 'en' ? grant.titleEn || grant.title : grant.title,
    funder: [lang === 'en' ? grant.funderEn || grant.funder : grant.funder,
      lang === 'en' ? grant.programEn || grant.program : grant.program].filter(Boolean).join(' · '),
    role: roles[lang][grant.role] || grant.role,
    period: `${grant.start}–${grant.end || (lang === 'en' ? 'present' : '현재')}`,
  }));
}
