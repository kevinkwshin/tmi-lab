export const content = {
  ko: {
    nav: [{ id: 'translation', label: '기술이전' }, { id: 'research', label: '연구' }, { id: 'publications', label: '논문' }, { id: 'patents', label: '특허' }, { id: 'people', label: '구성원' }, { id: 'contact', label: '연락처' }],
    hero: {
      eyebrow: 'Inha University · Digital Medicine',
      titleLines: ['TMI-lab'],
      description: '실제 임상 문제를 풀기 위해 의료진의 판단과 워크플로우 개선을 돕는 AI를 연구하고 구현합니다.',
      primary: '기술이전 사례', secondary: '연구 살펴보기',
      caption: '의료영상의 해부학적 구조를 이해하고 정량화하는 연구',
    },
    intro: {
      label: 'Our mission', title: '정보를 지능으로,\n연구를 임상으로.',
      body: '임상 문제 정의부터 데이터·모델 설계, 사용 환경에 맞춘 평가까지. 기술의 가능성을 실제 의료의 쓰임으로 연결합니다.',
    },
    approach: {
      label: 'OUR APPROACH', title: '문제 정의부터 적용을 위한 평가까지',
      steps: [
        { title: '임상 문제를 구체화합니다', body: '의료진과 함께 반복되는 측정, 판독, 정보 정리 과정에서 연구 질문을 찾습니다.' },
        { title: '데이터와 방법을 연결합니다', body: '영상, 텍스트, 생체신호의 특성을 이해하고 문제에 맞는 AI 방법을 설계합니다.' },
        { title: '사용 조건을 평가합니다', body: '성능과 오류를 살피고, 새로운 데이터와 임상 업무에서의 유용성을 검증합니다.' },
      ],
    },
    research: {
      label: 'Research', title: '서로 다른 데이터,\n하나의 임상 질문.',
      intro: '의료영상과 생체신호 연구의 기반 위에, 멀티모달 AI와 임상 워크플로우 개선을 연구합니다.',
      items: [
        { title: '임상 워크플로우와 멀티모달 AI', body: '판독문과 임상정보를 분석하고, 서로 다른 데이터를 함께 활용하는 방법을 연구합니다. 임상 문서 분석과 치료 반응 예측 경험을 바탕으로 서지컬 트윈과 의료 AI 평가 체계를 새로운 연구 방향으로 탐구합니다.', tags: ['Clinical workflow', 'Multimodal learning', 'Medical LLMs'] },
        { title: '의료영상과 정량적 평가', body: 'CT, MRI, X-ray에서 병변과 해부학적 구조를 탐지·분할하고 정량화합니다. 췌장, 뇌, 근골격계, 심혈관 영상 연구를 통해 판독과 측정 업무를 지원하는 방법을 개발합니다.', tags: ['Medical imaging', 'Segmentation', 'Quantitative assessment'] },
        { title: '생체신호 AI와 견고한 평가', body: '심전도와 심음에서 임상적으로 의미 있는 패턴을 찾습니다. 신호 처리와 딥러닝을 연결하고, 학습에 사용하지 않은 데이터에서 성능을 평가해 모델의 일반화 가능성을 살핍니다.', tags: ['ECG & PCG', 'Signal processing', 'Robust evaluation'] },
      ],
    },
    translation: {
      label: 'Translation', title: '연구에서 시작해,\n기술이전으로.',
      intro: '',
      items: [
        { year: 2025, name: 'GreyNet', recipient: '잇피 · Itphy', body: '어깨 Grashey X-ray의 해부학적 랜드마크 검출과 촬영 자세 평가 기술.' },
        { year: 2024, name: 'AVIEW NeuroCAD', recipient: '코어라인소프트 · Coreline Soft', body: '비조영 뇌 CT에서 뇌출혈 의심 영역을 탐지하고 우선 판독을 지원하는 기술.' },
        { year: 2023, name: 'FlatNet', recipient: '프로메디우스 · Promedius', body: '체중 부하 족부 측면 X-ray에서 평발 평가를 위한 랜드마크를 검출하는 기술.' },
        { year: 2022, name: 'ProRetina', recipient: '프로메디우스 · Promedius', body: 'Bayesian U-Net을 활용한 망막 혈관 분할과 영상 품질 평가 기술.' },
      ],
    },
    publications: {
      label: 'Selected publications', title: '논문',
      intro: '',
      all: '전체 논문 보기', search: '논문 검색', searchPlaceholder: '제목, 저자, 학술지 또는 연도 검색',
      filters: { all: '전체', clinical: '임상·멀티모달', imaging: '의료영상', signals: '생체신호' },
      results: '{count}편의 논문', empty: '검색 조건에 맞는 논문이 없습니다.', reset: '검색 초기화', scholar: 'Google Scholar에서 전체 연구 보기',
    },
    people: {
      label: 'People', title: '구성원 소개', name: '신기원', role: '조교수 · PhD',
      affiliation: '인하대학교 의과대학 디지털의료학과',
      bio: '의료영상, 생체신호, 멀티모달 AI를 연구합니다. 기계공학과 의공학을 바탕으로, 빠르게 발전하는 AI 기술을 의료 현장의 문제에 맞게 해석하고 임상에서 활용할 수 있는 형태로 발전시키는 중개의학 연구를 수행합니다.',
      educationLabel: '학력', education: ['2023 · 울산대학교 의공학 박사', '2013 · 한양대학교 기계공학 석사', '2011 · 한양대학교 기계공학 학사'],
      careerLabel: '주요 경력', career: ['2025–현재 · 대한의료인공지능학회 학술위원', '2024–현재 · MICCAI Area/Program Chair', '2026–현재 · 인하대학교 의과대학 조교수', '2025–2026 · 울산대학교 의과대학 연구교수', '2023–2025 · 고려대학교 의과대학 연구교수', '2018–2023 · 서울아산병원 연구원·박사후연구원', '2013–2018 · 현대자동차 연구원'],
      profileLink: '인하대학교 공식 교수 소개',
    },
    contact: {
      label: 'Contact', title: '연구 협력 및 문의',
      body: '의료 AI 공동연구와 연구 관련 문의는 아래 업무용 이메일로 연락해 주세요.',
      emailLabel: '이메일', locationLabel: '연구실', location: '인하대학교 60주년기념관 318호',
    },
    footer: { affiliation: '인하대학교 의과대학 디지털의료학과', credit: 'TMI-lab · Translational Medical Intelligence' },
    ui: { menu: '메뉴 열기', close: '메뉴 닫기', skip: '본문으로 바로가기', language: '언어 선택', home: 'TMI-lab 홈' },
  },
  en: {
    nav: [{ id: 'translation', label: 'Translation' }, { id: 'research', label: 'Research' }, { id: 'publications', label: 'Publications' }, { id: 'patents', label: 'Patents' }, { id: 'people', label: 'People' }, { id: 'contact', label: 'Contact' }],
    hero: {
      eyebrow: 'Inha University · Digital Medicine',
      titleLines: ['TMI-lab'],
      description: 'We develop AI to support clinical decisions and workflows.',
      primary: 'Technology transfer', secondary: 'Research',
      caption: 'Research in understanding and quantifying anatomical structures in medical images',
    },
    intro: {
      label: 'Our mission', title: 'From information\nto intelligence.',
      body: 'We start with clinical questions, design data and models, and evaluate them for their intended use.',
    },
    approach: {
      label: 'OUR APPROACH', title: 'From defining the problem to evaluating its use',
      steps: [
        { title: 'Define a clinical question', body: 'Work with clinicians to identify research questions in measurement, interpretation, and information management.' },
        { title: 'Connect data and methods', body: 'Understand images, text, and biosignals, then design AI methods suited to the problem.' },
        { title: 'Evaluate for use', body: 'Examine performance and errors, and assess utility on new data and within clinical workflows.' },
      ],
    },
    research: {
      label: 'Research', title: 'Different data.\nA shared clinical question.',
      intro: 'Our research in multimodal AI and clinical workflows builds on experience in medical imaging and biosignal analysis.',
      items: [
        { title: 'Clinical workflow & multimodal AI', body: 'We study radiology reports, clinical information, and methods that combine different data types. Building on clinical document analysis and treatment response prediction, our emerging directions include surgical twins and medical AI evaluation.', tags: ['Clinical workflow', 'Multimodal learning', 'Medical LLMs'] },
        { title: 'Medical imaging & quantitative assessment', body: 'We develop methods to detect, segment, and quantify lesions and anatomy in CT, MRI, and X-ray. Our experience spans pancreatic, brain, musculoskeletal, and cardiovascular imaging, with a focus on supporting interpretation and measurement.', tags: ['Medical imaging', 'Segmentation', 'Quantitative assessment'] },
        { title: 'Biosignal AI & robust evaluation', body: 'We identify clinically meaningful patterns in electrocardiograms and heart sounds. By connecting signal processing with deep learning and testing on previously unseen data, we investigate how well models generalize.', tags: ['ECG & PCG', 'Signal processing', 'Robust evaluation'] },
      ],
    },
    translation: {
      label: 'Translation', title: 'Research translated\ninto technology.',
      intro: '',
      items: [
        { year: 2025, name: 'GreyNet', recipient: 'Itphy', body: 'Anatomical landmark detection and view positioning assessment for shoulder Grashey radiographs.' },
        { year: 2024, name: 'AVIEW NeuroCAD', recipient: 'Coreline Soft', body: 'Detection of suspected cerebral hemorrhage in non-contrast brain CT to support triage.' },
        { year: 2023, name: 'FlatNet', recipient: 'Promedius', body: 'Landmark detection for flatfoot assessment on weight-bearing lateral foot radiographs.' },
        { year: 2022, name: 'ProRetina', recipient: 'Promedius', body: 'Retinal vessel segmentation and image quality assessment using Bayesian U-Net.' },
      ],
    },
    publications: {
      label: 'Selected publications', title: 'Publications',
      intro: '',
      all: 'View all publications', search: 'Search publications', searchPlaceholder: 'Search title, author, journal, or year',
      filters: { all: 'All', clinical: 'Clinical & multimodal', imaging: 'Medical imaging', signals: 'Biosignals' },
      results: '{count} publications', empty: 'No publications match your search.', reset: 'Reset search', scholar: 'View all research on Google Scholar',
    },
    people: {
      label: 'People', title: 'People', name: 'Keewon Shin', role: 'Assistant Professor · PhD',
      affiliation: 'Department of Digital Medicine, Inha University College of Medicine',
      bio: 'Research interests span medical imaging, biosignals, and multimodal AI. With a background in mechanical and biomedical engineering, his translational research interprets advances in AI through clinical needs and develops them toward practical use in medicine.',
      educationLabel: 'Education', education: ['2023 · PhD, Biomedical Engineering, University of Ulsan', '2013 · MS, Mechanical Engineering, Hanyang University', '2011 · BS, Mechanical Engineering, Hanyang University'],
      careerLabel: 'Career & academic service', career: ['2025–present · Scientific Committee Member, Korean Society of Artificial Intelligence in Medicine', '2024–present · Area/Program Chair, MICCAI', '2026–present · Assistant Professor, Inha University College of Medicine', '2025–2026 · Research Professor, University of Ulsan College of Medicine', '2023–2025 · Research Professor, Korea University College of Medicine', '2018–2023 · Researcher and Postdoctoral Fellow, Asan Medical Center', '2013–2018 · Researcher, Hyundai Motor Company'],
      profileLink: 'Official Inha University profile',
    },
    contact: {
      label: 'Contact', title: 'Research collaboration\n& inquiries',
      body: 'For medical AI collaboration and research inquiries, please contact us at the work email below.',
      emailLabel: 'Email', locationLabel: 'Office', location: 'Room 318, 60th Anniversary Memorial Hall, Inha University',
    },
    footer: { affiliation: 'Department of Digital Medicine, Inha University College of Medicine', credit: 'TMI-lab · Translational Medical Intelligence' },
    ui: { menu: 'Open menu', close: 'Close menu', skip: 'Skip to content', language: 'Select language', home: 'TMI-lab home' },
  },
};
