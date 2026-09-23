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
      description: '의료 데이터의 복잡성을 임상적 통찰로 바꾸고, 진료의 다음 결정을 돕는 AI를 연구합니다.',
      primary: '기술이전 사례',
      secondary: '연구 살펴보기',
      caption: '의료영상의 해부학적 구조를 이해하고 정량화하는 연구'
    },
    intro: { label: 'Our mission', title: '정보를 지능으로,\n연구를 임상으로.', body: '좋은 예측은 진료의 변화를 만들어야 합니다. 영상과 생체신호, 임상기록을 연결해 진료 과정의 병목을 줄이고, 치료 후의 변화를 예측하며, 환자별 선택을 뒷받침하는 근거를 만듭니다.' },
    approach: {
      label: 'OUR APPROACH',
      title: '문제 정의부터 적용을 위한 평가까지',
      steps: [
        { title: '진료에서 질문을 찾습니다', body: '어디서 판단이 지연되고, 어떤 정보가 부족한가. 의료진과 함께 해결할 문제와 평가 기준을 정의합니다.' },
        { title: '다른 데이터를 함께 해석합니다', body: '해부학적 구조, 시간에 따른 변화, 임상 맥락을 반영해 문제에 맞는 AI를 설계합니다.' },
        { title: '성능을 임상적 가치로 연결합니다', body: '정확도와 불확실성, 새로운 데이터에서의 성능을 평가하고 진료 과정에 적용할 방법을 연구합니다.' }
      ]
    },
    research: {
      label: 'Research',
      title: '서로 다른 데이터,\n하나의 임상 질문.',
      intro: '의료영상과 생체신호 연구의 기반 위에, 멀티모달 AI와 임상 워크플로우 개선을 연구합니다.',
      items: [
        {
          title: '임상 워크플로우 개선',
          question: '분석 결과가 다음 진료로 이어지도록.',
          body: '촬영부터 판독, 기록 검토까지. 의료진이 놓치기 쉬운 신호와 반복 확인하는 정보를 AI로 찾아, 필요한 판단이 제때 이루어지는 워크플로우를 연구합니다.',
          tags: [ 'Triage', 'Image quality', 'Clinical workflow' ]
        },
        {
          title: '디지털 트윈',
          question: '치료 이후를 예측하는 환자별 모델.',
          body: '해부학적 구조와 시간에 따른 변화를 모델링합니다. 성장 예측 연구를 기반으로, 수술 전 영상과 임상정보에서 수술 후 상태를 예측하는 서지컬 디지털 트윈으로 연구를 확장합니다.',
          tags: [ 'Preoperative data', 'Outcome prediction', 'Surgical planning' ]
        },
        {
          title: '정밀의료 · 근거기반 치료',
          question: '같은 진단을 넘어, 환자별 치료의 근거로.',
          body: '영상 속 미세한 구조와 생체신호의 패턴을 정량화하고, 예측이 얼마나 신뢰할 만한지 함께 평가합니다. 환자별 위험과 치료 반응을 해석하는 근거기반 정밀의료를 지향합니다.',
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
      description: 'We turn complex medical data into intelligence for clinical decisions.',
      primary: 'Technology transfer',
      secondary: 'Research',
      caption: 'Research in understanding and quantifying anatomical structures in medical images'
    },
    intro: {
      label: 'Our mission',
      title: 'From information\nto intelligence.',
      body: 'Better predictions should lead to better clinical decisions. We connect imaging, biosignals and clinical records to address workflow bottlenecks, anticipate treatment outcomes and build evidence for individual care.'
    },
    approach: {
      label: 'OUR APPROACH',
      title: 'From defining the problem to evaluating its use',
      steps: [
        { title: 'Start with a clinical question', body: 'Where do decisions stall, and what information is missing? We define the question and evaluation criteria with clinicians.' },
        { title: 'Interpret data in context', body: 'We design methods around anatomy, longitudinal change and the clinical context of each problem.' },
        { title: 'Connect performance to clinical value', body: 'We evaluate accuracy, uncertainty and performance on new data, then study how the results can inform care.' }
      ]
    },
    research: {
      label: 'Research',
      title: 'Different data.\nA shared clinical question.',
      intro: 'Our research in multimodal AI and clinical workflows builds on experience in medical imaging and biosignal analysis.',
      items: [
        {
          title: 'Clinical workflow',
          question: 'From an AI output to the next clinical action.',
          body: 'From acquisition and interpretation to record review, we study how AI can surface overlooked signals and repeated checks at the point where clinicians need them.',
          tags: [ 'Triage', 'Image quality', 'Clinical workflow' ]
        },
        {
          title: 'Digital twins',
          question: 'Patient-specific models of what comes next.',
          body: 'We model anatomy and its change over time. Building on growth-prediction research, we are extending this work toward surgical digital twins that predict postoperative states from preoperative images and clinical data.',
          tags: [ 'Preoperative data', 'Outcome prediction', 'Surgical planning' ]
        },
        {
          title: 'Precision medicine',
          question: 'Beyond a shared diagnosis, evidence for the individual.',
          body: 'We quantify subtle structures in images and patterns in biosignals, while assessing how much confidence to place in each prediction. These foundations support our research toward individual risk assessment and treatment response.',
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
