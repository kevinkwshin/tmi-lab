// Curated public CV content. Keep translations together; never add private contact details.
// Appointments/education/teaching: PI-provided CV, updated 11 November 2026.
// Affiliation, public contact, current project and research: existing reviewed lab website.
// Service start years conflict between source versions and are deliberately omitted.
const bi = (ko, en) => ({ko, en});

export const cvProfile = {
  name: bi('신기원', 'Keewon Shin'),
  degree: 'PhD',
  updated: '2026-11-11',
  email: 'kevinkwshin@inha.ac.kr',
  affiliation: bi('인하대학교 의과대학 디지털의료학과', 'Department of Digital Medicine, Inha University College of Medicine'),
  role: bi('조교수 · 중개의료지능 연구실 책임자', 'Assistant Professor · Director, Translational Medical Intelligence Lab'),
  office: bi('인하대학교 60주년기념관 318호', 'Room 318, 60th Anniversary Memorial Hall, Inha University'),
  summary: bi(
    '의료영상·생체신호·임상기록을 연결하는 멀티모달 의료 AI를 연구합니다. 임상 워크플로우 개선, 환자별 변화 예측, 근거기반 치료를 위한 중개연구를 수행합니다.',
    'Developing multimodal medical AI across imaging, physiological signals and clinical records, with a focus on clinical workflows, patient-specific prediction and evidence-based care.'
  ),
  links: [
    {label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=prJCNYoAAAAJ&hl=en'},
    {label: 'ORCID', url: 'https://orcid.org/0000-0002-5028-5716'},
    {label: 'GitHub', url: 'https://github.com/kevinkwshin'},
    {label: bi('인하대학교 교수 소개', 'Inha faculty profile'), url: 'https://medicine.inha.ac.kr/medicine/9606/subview.do'}
  ],
  research: [
    bi('임상 워크플로우: 영상 품질 평가, 우선 판독, 추적관찰 판독문 검토', 'Clinical workflows: image quality, imaging triage and longitudinal report review'),
    bi('디지털 트윈: 해부학적 구조와 변화 모델링, 수술 후 상태 예측 연구', 'Digital twins: anatomical modeling, longitudinal change and research toward postoperative prediction'),
    bi('정밀의료: 의료영상·생체신호·임상정보 기반 디지털 바이오마커와 예측 신뢰도', 'Precision medicine: digital biomarkers and predictive reliability across imaging, biosignals and clinical information')
  ],
  appointments: [
    {from: '2026-09', to: null, title: bi('조교수', 'Assistant Professor'), institution: bi('인하대학교 의과대학 · 인하대학교병원', 'Inha University College of Medicine · Inha University Hospital'), details: [bi('중개의료지능 연구실 책임자 · AI빅데이터센터 부센터장', 'Director, Translational Medical Intelligence Lab · Deputy Director, AI Big Data Center')]},
    {from: '2025-07', to: '2026-08', title: bi('연구교수', 'Research Professor'), institution: bi('울산대학교 의과대학 · 서울아산병원', 'University of Ulsan College of Medicine · Asan Medical Center'), details: [bi('뇌 CT–판독문 멀티모달 정렬 연구, 의료 멀티모달 LLM 검증 및 EMR 기반 감염 탐지 과제 관리', 'Brain CT–report multimodal alignment; project management for medical multimodal LLM validation and EMR-based infection detection')]},
    {from: '2023-07', to: '2025-06', title: bi('연구교수', 'Research Professor'), institution: bi('고려대학교 의과대학 · 안암병원', 'Korea University College of Medicine · Anam Hospital'), details: [bi('AI·디지털 헬스케어 연구 플랫폼 과제 관리', 'Project management for an AI and digital healthcare research platform')]},
    {from: '2023-02', to: '2023-06', title: bi('박사후연구원', 'Postdoctoral Fellow'), institution: bi('서울아산병원', 'Asan Medical Center'), details: [bi('수술 중 생체신호 기반 AI 연구팀 운영', 'Led an AI research team working with intraoperative vital signs')]},
    {from: '2018-05', to: '2023-01', title: bi('AI 연구원', 'AI Researcher'), institution: bi('울산대학교 아산융합의학원', 'Asan Medical Institute of Convergence Science and Technology, University of Ulsan'), details: [bi('머신러닝을 활용한 의료영상 연구', 'Machine-learning research across medical imaging modalities')]},
    {from: '2013-02', to: '2018-03', title: bi('차량 소음·진동 연구원', 'Vehicle Noise and Vibration Researcher'), institution: bi('현대자동차', 'Hyundai Motor Company'), details: [bi('음향·진동 신호처리, 능동 사운드 설계, 능동 소음 제어 및 햅틱 경고 시스템', 'Acoustic and vibration signal processing, active sound design, active noise control and haptic warning systems')]}
  ],
  education: [
    {from: '2019', to: '2023', title: bi('의공학 박사', 'PhD, Biomedical Engineering'), institution: bi('울산대학교 · 아산융합의학원', 'University of Ulsan · Asan Medical Institute of Convergence Science and Technology'), details: [bi('의료 AI 연구 · 지도교수: 김남국', 'Medical AI · Advisor: Namkug Kim')]},
    {from: '2011', to: '2013', title: bi('기계공학 석사', 'MS, Mechanical Engineering'), institution: bi('한양대학교', 'Hanyang University'), details: [bi('소음·진동 연구 · 지도교수: 장건희', 'Noise and vibration · Advisor: Gunhee Jang')]},
    {from: '2004', to: '2011', title: bi('기계공학 학사', 'BS, Mechanical Engineering'), institution: bi('한양대학교', 'Hanyang University'), details: [bi('우등 졸업', 'Cum laude')]}
  ],
  // Grants and conference contributions live in cv-records.json and the local editor.
  projects: [],
  service: [
    {title: bi('학술위원', 'Academic Committee Member'), institution: bi('대한의료인공지능학회', 'Korean Society of Artificial Intelligence in Medicine')},
    {title: 'Area Chair', institution: 'Medical Image Computing and Computer Assisted Intervention (MICCAI)'}
  ],
  teaching: [
    {from: '2026', title: bi('데이터베이스 관리 시스템', 'Database Management System'), institution: bi('인하대학교', 'Inha University')},
    {from: '2020', to: '2022', title: bi('머신러닝 강의', 'Machine Learning Lecturer'), institution: bi('한국보건복지인재원(KOHI)', 'Korea Human Resource Development Institute for Health and Welfare (KOHI)')},
    {from: '2020', to: '2022', title: bi('의료영상·머신러닝 수업 조교', 'Teaching Assistant, Medical Imaging and Machine Learning'), institution: bi('울산대학교 아산융합의학원', 'Asan Medical Institute of Convergence Science and Technology, University of Ulsan')},
    {from: '2019', to: '2021', title: bi('머신러닝 수업 조교', 'Machine Learning Teaching Assistant'), institution: bi('대한의료인공지능학회', 'Korean Society of Artificial Intelligence in Medicine')}
  ],
  awards: [
    {from: '2024', title: bi('Future Mobility 세션 우수논문상', 'Best Paper Award, Future Mobility Session'), institution: bi('한국소음진동공학회', 'Korean Society for Noise and Vibration Engineering')},
    {from: '2024', title: bi('Outstanding Medical Science Researcher', 'Outstanding Medical Science Researcher'), institution: 'Medical Research Information Center'},
    {from: '2023', title: bi('한빛사 선정', 'Selected for BRIC Hanbitsa'), institution: bi('생물학연구정보센터(BRIC)', 'Biological Research Information Center (BRIC)')},
    {from: '2022', title: bi('COVID Segmentation Grand Challenge 14위', '14th Place, COVID Segmentation Grand Challenge'), institution: 'Medical Imaging Grand Challenge'},
    {from: '2020', title: bi('우수 구연 발표상', 'Outstanding Oral Presentation Award'), institution: bi('대한의료인공지능학회', 'Korean Society of Artificial Intelligence in Medicine')},
    {from: '2019', title: bi('LANL Earthquake Prediction Challenge 43위', '43rd Place, LANL Earthquake Prediction Challenge'), institution: 'Kaggle · Los Alamos National Laboratory'},
    {from: '2019', title: bi('RSNA Pneumonia Detection Challenge 31위', '31st Place, RSNA Pneumonia Detection Challenge'), institution: 'Kaggle · Radiological Society of North America'},
    {from: '2019', to: '2020', title: bi('성적우수 장학금', 'Academic Excellence Scholarship'), institution: bi('울산대학교', 'University of Ulsan')},
    {from: '2017', title: bi('디지털 차량 개발 경진대회 은상', 'Silver Prize, Digital Vehicle Development Competition'), institution: bi('현대자동차', 'Hyundai Motor Company')},
    {from: '2011', to: '2012', title: bi('차세대 자동차 장학금', 'Next Generation Vehicle Academic Scholarship'), institution: bi('현대자동차', 'Hyundai Motor Company')},
    {from: '2010', title: bi('지식재산 경진대회 은상', 'Silver Prize, Intellectual Property Competition'), institution: bi('특허청', 'Korean Intellectual Property Office')}
  ],
  conferences: [],
  skills: [
    {label: bi('프로그래밍', 'Programming'), value: 'Python, Swift, MATLAB'},
    {label: bi('AI·영상', 'AI & imaging'), value: 'PyTorch, TensorFlow, scikit-learn, OpenCV, DICOM, ITK / SimpleITK, 3D Slicer'},
    {label: bi('LLM', 'LLMs'), value: 'Fine-tuning, retrieval-augmented generation, prompt engineering, MCP'},
    {label: bi('신호처리', 'Signal processing'), value: bi('디지털 신호처리, 음향·진동 분석', 'Digital signal processing, acoustic and vibration analysis')},
    {label: bi('개발 환경', 'Development'), value: 'Git, Docker, Linux, AWS, Google Cloud Platform'},
    {label: bi('언어', 'Languages'), value: bi('한국어(모국어), 영어', 'Korean (native), English')}
  ]
};
