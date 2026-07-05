# 한번 마케팅 — 랜딩 페이지

치과·피부과 전문 디지털 마케팅 통합 솔루션 랜딩 페이지 + 서비스 서브페이지

---

## ✅ 완료된 기능

### 메인 (index.html)
- Hero 섹션, Pain Point 섹션
- 서비스 카드 8종 매소리 그리드 (카드 1·2·3 → 서브페이지 링크 연결)
- 성과 통계, 진행 방식, 문의 폼 섹션
- 반응형 네비게이션 (햄버거 메뉴)
- `contactForm`, `phoneInput` null 안전 처리

### 네이버 플레이스 서브페이지 (naver-place.html)
- 10개 섹션 완성
- Canvas pixel blur v3 (7개 이미지, 정밀 좌표 적용)
- About 섹션: 길동역치과 실제 포트폴리오 이미지
- FAQ 6개 수동 편집

### AI 솔루션 서브페이지 (ai-solution.html)
- Hero: 어두운 배경 + SEO/AEO/GEO 배지 + 스코어 카운터 애니메이션
- 문제 제기, SEO·AEO·GEO 개념 소개 섹션
- 홈페이지 AI 진단기 (솔루션 1): URL 입력 → 로딩 → 점수 결과
- AI 리뷰 자동 생성기 (솔루션 2): 5단계 선택 위젯 + 타이핑 효과
- 성과 지표 및 최종 CTA

### 정기검진 환자관리 서브페이지 (patient-care.html) ⭐ NEW
- **히어로**: 배경 이미지(cdn.imweb.me) + 오버레이 + 브레드크럼 + 메인 카피
- **서비스 탭**: 서비스 페이지 간 내비게이션 탭
- **인트로 이미지**: 서비스 소개 인포그래픽 2장
- **파트너 병원 100+**: PC 4열 / 모바일 2열 테이블, 전체 병원 목록 표시
- **인지심리학 기반 콜 스크립트**: 설득 구조(흐름 다이어그램) + 핵심 흐름 테이블 + 환자 선정 카드
- **비용 및 수익률 분석**: 분석 이미지 섹션
- **구글시트 관리 시스템**: 텍스트 + 모니터 이미지, 3가지 핵심 기능 리스트
- **CTA**: "정기검진 콜 진단 받기" → qna.html 연결
- **원장 후기 슬라이더**: Swiper.js 5개 카드 (loop + autoplay + pagination)
- **유튜브 채널**: '인생유통기한 연장' 10개 영상 그리드 (5열→2열 반응형)
- **Contact**: 블로그/유튜브/오픈채팅 링크 카드 3개
- **푸터**: 사업자 정보 + 사이트맵

### 비주얼 에디터 (blur-editor.html)
- Canvas blur 좌표 드래그/슬라이더/숫자 입력 비주얼 에디터

---

## 📁 파일 구조

```
index.html              ← 메인 랜딩 페이지
naver-place.html        ← 네이버 플레이스 서브페이지
ai-solution.html        ← AI 솔루션 서브페이지
patient-care.html       ← 정기검진 환자관리 서브페이지 ⭐ NEW
blur-editor.html        ← blur 좌표 에디터 (내부용)

css/
  style.css             ← 메인 스타일
  naver-place.css       ← 네이버 플레이스 스타일
  ai-solution.css       ← AI 솔루션 스타일
  patient-care.css      ← 정기검진 환자관리 스타일 ⭐ NEW

js/
  main.js               ← 메인 JS
  naver-place.js        ← Canvas blur v3
  ai-solution.js        ← AI 솔루션 인터랙션 ⭐ NEW

images/
  pain-*.png            ← Pain point 일러스트
  proof/
    판교치과.png
    길동역치과.png
    가락동치과.png
    진천치과.png
    수유역치과.png
    명일동치과.png
    광명피부과.png
```

---

## 🔗 URI 진입점

| 경로 | 설명 |
|------|------|
| `index.html` | 메인 랜딩 페이지 |
| `naver-place.html` | 네이버 플레이스 상위노출 서브페이지 |
| `ai-solution.html` | AI 솔루션 서브페이지 (진단기 + 리뷰생성기) |
| `ai-solution.html#diagnostic` | 홈페이지 AI 진단기 바로 이동 |
| `ai-solution.html#review` | AI 리뷰 자동 생성기 바로 이동 |
| `patient-care.html` | 정기검진 환자관리 서브페이지 ⭐ NEW |
| `patient-care.html#partners` | 파트너 병원 100+ 목록 바로 이동 |
| `patient-care.html#script` | 콜 스크립트 요약 섹션 바로 이동 |
| `patient-care.html#cost` | 비용 분석 섹션 바로 이동 |
| `patient-care.html#reviews` | 원장 후기 슬라이더 바로 이동 |
| `patient-care.html#youtube` | 유튜브 채널 섹션 바로 이동 |
| `blur-editor.html` | blur 좌표 비주얼 에디터 (내부용) |

---

## 🗄️ 데이터 모델

- **RESTful Table API 미사용** (순수 정적 사이트)
- 진단기: 클라이언트 사이드 시뮬레이션 (랜덤 스코어 + 개선 항목 풀)
- 리뷰 생성기: 클라이언트 사이드 템플릿 룩업 (언어×방문유형×진료 조합)

---

## ⚙️ 기술 스택

- **HTML5 / CSS3 / Vanilla JS (ES6+)**
- Google Fonts — Noto Sans KR
- Font Awesome 6.4.0 (CDN)
- IntersectionObserver 스크롤 애니메이션
- requestAnimationFrame 카운터 애니메이션
- Canvas pixel blur (naver-place.js)
- Clipboard API + fallback (execCommand)

---

## 🚧 미구현 / 권장 다음 단계

- [ ] 카드 4~8 서브페이지 제작 (오프라인 광고, 브랜드 블로그 등)
- [ ] 정기검진 patient-care.html에 qna.html 폼 실제 연동
- [ ] 실제 AutoPoster API 연동 (진단기 실제 크롤링/점수 반환)
- [ ] AI 리뷰 생성기 실제 LLM API 연동 (GPT/Claude)
- [ ] 구글 리뷰 URL을 실제 병원별 링크로 교체
- [ ] 문의 폼 백엔드 연동 (이메일 발송 / CRM 연결)
- [ ] 다국어(영어) 지원

---

## 📞 도입 문의

**010-7174-8074** | 한번 마케팅 × METALINK
