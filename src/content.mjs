export const content = {
  ko: {
    nav: [
      { id: 'translation', label: '기술이전' },
      { id: 'research', label: '연구' },
      { id: 'publications', label: '논문' },
      { id: 'patents', label: '특허' },
      { id: 'people', label: '구성원' },
      { id: 'contact', label: '연락처' }
    ],
    hero: {
      eyebrow: 'Inha University · Digital Medicine',
      titleLines: [ 'TMI-lab' ],
      description: '실제 임상 문제를 풀기 위해 의료진의 판단과 워크플로우 개선을 돕는 AI를 연구하고 구현합니다.',
      primary: '기술이전 사례',
      secondary: '연구 살펴보기',
      caption: '의료영상의 해부학적 구조를 이해하고 정량화하는 연구'
    },
    intro: { label: 'Our mission', title: '정보를 지능으로,\n연구를 임상으로.', body: '촬영과 판독의 지연을 줄이고, 수술 후의 변화를 예측하며, 환자별 치료 선택을 근거로 뒷받침합니다. 임상 워크플로우, 디지털 트윈, 정밀의료를 잇는 중개연구를 지향합니다.' },
    approach: {
      label: 'OUR APPROACH',
      title: '문제 정의부터 적용을 위한 평가까지',
      steps: [
        { title: '임상 문제를 구체화합니다', body: '의료진과 함께 반복되는 측정, 판독, 정보 정리 과정에서 연구 질문을 찾습니다.' },
        { title: '데이터와 방법을 연결합니다', body: '영상, 텍스트, 생체신호의 특성을 이해하고 문제에 맞는 AI 방법을 설계합니다.' },
        { title: '사용 조건을 평가합니다', body: '성능과 오류를 살피고, 새로운 데이터와 임상 업무에서의 유용성을 검증합니다.' }
      ]
    },
    research: {
      label: 'Research',
      title: '서로 다른 데이터,\n하나의 임상 질문.',
      intro: '의료영상과 생체신호 연구의 기반 위에, 멀티모달 AI와 임상 워크플로우 개선을 연구합니다.',
      items: [
        {
          title: '임상 워크플로우 개선',
          question: '필요한 판단을, 필요한 순간에.',
          body: 'AI의 결과가 진료의 다음 행동으로 이어지도록 연구합니다. 뇌출혈 의심 환자의 우선 판독, 촬영 직후의 품질 확인, 반복되는 측정의 자동화를 통해 의료진이 중요한 판단에 집중할 수 있도록 돕습니다.',
          tags: [ 'Triage', 'Image quality', 'Clinical workflow' ]
        },
        {
          title: '디지털 트윈',
          question: '수술 전에, 수술 후를 예측하다.',
          body: '수술 전 영상과 임상정보로 환자별 수술 후 상태를 예측하는 서지컬 디지털 트윈을 연구합니다. 치료 시나리오에 따른 변화를 비교해, 수술 계획과 환자 상담에 활용할 수 있는 예측 근거를 만드는 것이 목표입니다.',
          tags: [ 'Preoperative data', 'Outcome prediction', 'Surgical planning' ]
        },
        {
          title: '정밀의료 · 근거기반 치료',
          question: '이 환자에게 맞는 치료의 근거.',
          body: '의료영상·생체신호·임상정보를 연결해 환자별 차이와 치료 반응을 분석합니다. 정량적 측정과 예측의 불확실성을 함께 평가하여, 의료진이 치료의 선택과 효과를 판단할 수 있는 근거를 연구합니다.',
          tags: [ 'Quantitative imaging', 'Treatment response', 'Uncertainty' ]
        }
      ]
    },
    translation: {
      label: 'Translation',
      title: '연구의 가치를,\n진료의 변화로.',
      intro: '',
      items: [
        {
          year: 2025,
          name: 'GreyNet',
          recipient: '잇피 · Itphy',
          body: 'Grashey X-ray의 촬영 자세와 품질을 평가해, 재촬영이 필요한 경우 방사선사에게 즉시 요청하는 솔루션입니다. 환자가 촬영실을 떠나기 전 품질을 확인하는 워크플로우를 지향합니다.',
          impact: '촬영 직후 품질을 확인'
        },
        { year: 2024, name: 'AVIEW NeuroCAD', recipient: '코어라인소프트 · Coreline Soft', body: '비조영 뇌 CT에서 뇌출혈 의심 영역을 탐지하고 우선 판독을 지원하는 기술.' },
        {
          year: 2023,
          name: 'FlatNet',
          recipient: '프로메디우스 · Promedius',
          body: '체중 부하 족부 측면 X-ray의 랜드마크를 검출합니다. 전문의와 비교한 연구에서 더 낮은 검출 오차를 보여, 평가자에 따른 측정 편차를 줄이고 일관된 평발 평가를 돕습니다.',
          impact: '평발 평가를 더 객관적으로',
          source: 'https://pubmed.ncbi.nlm.nih.gov/35961089/'
        },
        {
          year: 2022,
          name: 'ProRetina',
          recipient: '프로메디우스 · Promedius',
          body: 'Bayesian U-Net의 불확실성(Uncertainty)을 활용해 망막 혈관 분할 성능을 높이면서 영상 품질을 함께 평가합니다. 분석 결과와 신뢰도를 함께 살피는 모델입니다.',
          impact: '혈관 분할과 품질 평가를 함께'
        }
      ]
    },
    publications: {
      label: 'Selected publications',
      title: '논문',
      intro: '',
      all: '전체 논문 보기',
      search: '논문 검색',
      searchPlaceholder: '제목, 저자, 학술지 또는 연도 검색',
      filters: { all: '전체', clinical: '임상·멀티모달', imaging: '의료영상', signals: '생체신호' },
      results: '{count}편의 논문',
      empty: '검색 조건에 맞는 논문이 없습니다.',
      reset: '검색 초기화',
      scholar: 'Google Scholar에서 전체 연구 보기'
    },
    people: {
      label: 'People',
      title: '구성원 소개',
      name: '신기원',
      role: '조교수 · PhD',
      affiliation: '인하대학교 의과대학 디지털의료학과',
      bio: '빠르게 발전하는 AI를 의료 현장에 도입하는 중개연구를 수행합니다. 의료영상·생체신호·멀티모달 AI를 바탕으로 임상 워크플로우 개선, 수술 결과 예측, 근거기반 치료를 연구합니다.',
      educationLabel: '학력',
      education: [ '2023 · 울산대학교 의공학 박사', '2013 · 한양대학교 기계공학 석사', '2011 · 한양대학교 기계공학 학사' ],
      careerLabel: '주요 경력',
      career: [
        '2025–현재 · 대한의료인공지능학회 학술위원',
        '2024–현재 · MICCAI Area/Program Chair',
        '2026–현재 · 인하대학교 의과대학 조교수',
        '2025–2026 · 울산대학교 의과대학 연구교수',
        '2023–2025 · 고려대학교 의과대학 연구교수',
        '2018–2023 · 서울아산병원 연구원·박사후연구원',
        '2013–2018 · 현대자동차 연구원'
      ],
      profileLink: '인하대학교 공식 교수 소개'
    },
    contact: { label: 'Contact', title: '연구 협력 및 문의', body: '의료 AI 공동연구와 연구 관련 문의는 아래 업무용 이메일로 연락해 주세요.', emailLabel: '이메일', locationLabel: '연구실', location: '인하대학교 60주년기념관 318호' },
    footer: { affiliation: '인하대학교 의과대학 디지털의료학과', credit: 'TMI-lab · Translational Medical Intelligence' },
    ui: { menu: '메뉴 열기', close: '메뉴 닫기', skip: '본문으로 바로가기', language: '언어 선택', home: 'TMI-lab 홈' }
  },
  en: {
    nav: [
      { id: 'translation', label: 'Translation' },
      { id: 'research', label: 'Research' },
      { id: 'publications', label: 'Publications' },
      { id: 'patents', label: 'Patents' },
      { id: 'people', label: 'People' },
      { id: 'contact', label: 'Contact' }
    ],
    hero: {
      eyebrow: 'Inha University · Digital Medicine',
      titleLines: [ 'TMI-lab' ],
      description: 'We develop AI to support clinical decisions and workflows.',
      primary: 'Technology transfer',
      secondary: 'Research',
      caption: 'Research in understanding and quantifying anatomical structures in medical images'
    },
    intro: {
      label: 'Our mission',
      title: 'From information\nto intelligence.',
      body: 'We aim to reduce delays in imaging and interpretation, anticipate surgical outcomes, and support evidence-based treatment choices through clinical workflows, digital twins, and precision medicine.'
    },
    approach: {
      label: 'OUR APPROACH',
      title: 'From defining the problem to evaluating its use',
      steps: [
        { title: 'Define a clinical question', body: 'Work with clinicians to identify research questions in measurement, interpretation, and information management.' },
        { title: 'Connect data and methods', body: 'Understand images, text, and biosignals, then design AI methods suited to the problem.' },
        { title: 'Evaluate for use', body: 'Examine performance and errors, and assess utility on new data and within clinical workflows.' }
      ]
    },
    research: {
      label: 'Research',
      title: 'Different data.\nA shared clinical question.',
      intro: 'Our research in multimodal AI and clinical workflows builds on experience in medical imaging and biosignal analysis.',
      items: [
        {
          title: 'Clinical workflow',
          question: 'The right insight, at the right moment.',
          body: 'We connect AI outputs to the next clinical action: prioritizing suspected hemorrhage, checking image quality at acquisition, and automating repeated measurements so clinicians can focus on decisions that matter.',
          tags: [ 'Triage', 'Image quality', 'Clinical workflow' ]
        },
        {
          title: 'Digital twins',
          question: 'Anticipate outcomes before surgery.',
          body: 'We study surgical digital twins that use preoperative images and clinical data to predict a patient’s postoperative state. Our goal is to compare treatment scenarios and build evidence for surgical planning and patient discussions.',
          tags: [ 'Preoperative data', 'Outcome prediction', 'Surgical planning' ]
        },
        {
          title: 'Precision medicine',
          question: 'Evidence for each patient’s treatment.',
          body: 'We combine medical images, biosignals, and clinical information to study individual differences and treatment response. Quantitative measurements and uncertainty estimates help build evidence for evaluating treatment choices and outcomes.',
          tags: [ 'Quantitative imaging', 'Treatment response', 'Uncertainty' ]
        }
      ]
    },
    translation: {
      label: 'Translation',
      title: 'From research\nto clinical impact.',
      intro: '',
      items: [
        {
          year: 2025,
          name: 'GreyNet',
          recipient: 'Itphy',
          body: 'Evaluates Grashey X-ray positioning and quality to request an immediate retake from the radiographer when needed, enabling quality checks before the patient leaves the imaging room.',
          impact: 'Quality checks at acquisition'
        },
        { year: 2024, name: 'AVIEW NeuroCAD', recipient: 'Coreline Soft', body: 'Detection of suspected cerebral hemorrhage in non-contrast brain CT to support triage.' },
        {
          year: 2023,
          name: 'FlatNet',
          recipient: 'Promedius',
          body: 'Detects landmarks on weight-bearing lateral foot X-rays. A comparative study found lower landmark errors than an orthopedic surgeon, supporting more consistent measurements for flatfoot assessment.',
          impact: 'More objective flatfoot assessment',
          source: 'https://pubmed.ncbi.nlm.nih.gov/35961089/'
        },
        {
          year: 2022,
          name: 'ProRetina',
          recipient: 'Promedius',
          body: 'Uses Bayesian U-Net uncertainty to improve retinal vessel segmentation while assessing image quality, bringing the analysis and its reliability into the same model.',
          impact: 'Segmentation with quality assessment'
        }
      ]
    },
    publications: {
      label: 'Selected publications',
      title: 'Publications',
      intro: '',
      all: 'View all publications',
      search: 'Search publications',
      searchPlaceholder: 'Search title, author, journal, or year',
      filters: { all: 'All', clinical: 'Clinical & multimodal', imaging: 'Medical imaging', signals: 'Biosignals' },
      results: '{count} publications',
      empty: 'No publications match your search.',
      reset: 'Reset search',
      scholar: 'View all research on Google Scholar'
    },
    people: {
      label: 'People',
      title: 'People',
      name: 'Keewon Shin',
      role: 'Assistant Professor · PhD',
      affiliation: 'Department of Digital Medicine, Inha University College of Medicine',
      bio: 'Translational research brings advances in AI into clinical practice. His work connects medical imaging, biosignals, and multimodal AI with clinical workflows, surgical outcome prediction, and evidence-based treatment.',
      educationLabel: 'Education',
      education: [
        '2023 · PhD, Biomedical Engineering, University of Ulsan',
        '2013 · MS, Mechanical Engineering, Hanyang University',
        '2011 · BS, Mechanical Engineering, Hanyang University'
      ],
      careerLabel: 'Career & academic service',
      career: [
        '2025–present · Scientific Committee Member, Korean Society of Artificial Intelligence in Medicine',
        '2024–present · Area/Program Chair, MICCAI',
        '2026–present · Assistant Professor, Inha University College of Medicine',
        '2025–2026 · Research Professor, University of Ulsan College of Medicine',
        '2023–2025 · Research Professor, Korea University College of Medicine',
        '2018–2023 · Researcher and Postdoctoral Fellow, Asan Medical Center',
        '2013–2018 · Researcher, Hyundai Motor Company'
      ],
      profileLink: 'Official Inha University profile'
    },
    contact: {
      label: 'Contact',
      title: 'Research collaboration\n& inquiries',
      body: 'For medical AI collaboration and research inquiries, please contact us at the work email below.',
      emailLabel: 'Email',
      locationLabel: 'Office',
      location: 'Room 318, 60th Anniversary Memorial Hall, Inha University'
    },
    footer: { affiliation: 'Department of Digital Medicine, Inha University College of Medicine', credit: 'TMI-lab · Translational Medical Intelligence' },
    ui: { menu: 'Open menu', close: 'Close menu', skip: 'Skip to content', language: 'Select language', home: 'TMI-lab home' }
  }
};
