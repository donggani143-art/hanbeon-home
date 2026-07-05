/**
 * ai-solution.js  v2
 * 한번 마케팅 — AI 솔루션 서브페이지
 *
 * 구성:
 *  1. Hero 점수 카운터 애니메이션
 *  2. IntersectionObserver 스크롤 fade-in
 *  3. 홈페이지 AI 진단기 (시뮬레이션)
 *  4. AI 리뷰 자동 생성기 v2 (실제 코드 기반 — API 연동 대비)
 */

'use strict';

/* ==========================================
   0. REVIEW CONFIG
   실제 서비스 적용 시 병원별 값으로 교체하세요
========================================== */
window.REVIEW_CONFIG = {
  reviewType:      'google',
  reviewId:        'ChIJKxPfhdY0YzURE6Ft9bwFJj4', // 구글 Place ID
  hospitalName:    '서울365열린치과의원',
  doctorName:      '고성혁',
  hospitalTel:     '031-594-2080',
  hospitalAddress: '경기 남양주시 화도읍 비룡로 112 102호'
};

/* ==========================================
   1. DOMContentLoaded
========================================== */
document.addEventListener('DOMContentLoaded', () => {
  initScrollObserver();
  initHeroCounter();
  initDiagnosticEnter();
  initReviewWidget();
});

/* ==========================================
   2. 스크롤 Fade-in
========================================== */
function initScrollObserver() {
  const targets = document.querySelectorAll(
    '.problem-card, .concept-card, .stat-card, .rf-item, .fade-up'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => { el.dataset.delay = i * 80; io.observe(el); });
}

/* ==========================================
   3. Hero 점수 카운터
========================================== */
function initHeroCounter() {
  const scores = [
    { elId: 'heroSeoScore', barId: 'heroSeoBar', val: 26, max: 33 },
    { elId: 'heroAeoScore', barId: 'heroAeoBar', val: 21, max: 30 },
    { elId: 'heroGeoScore', barId: 'heroGeoBar', val: 24, max: 29 }
  ];
  const row = document.getElementById('heroScoreRow');
  if (!row) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      io.disconnect();
      scores.forEach(({ elId, barId, val, max }) => animateCount(elId, barId, val, max));
    }
  }, { threshold: 0.3 });
  io.observe(row);
}

function animateCount(elId, barId, target, max) {
  const el = document.getElementById(elId);
  const bar = document.getElementById(barId);
  if (!el || !bar) return;
  const duration = 1200;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.innerHTML = `${current}<small>/${max}</small>`;
    bar.style.width = `${(current / max) * 100}%`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ==========================================
   4. 진단기 — Enter 키
========================================== */
function initDiagnosticEnter() {
  const urlInput = document.getElementById('diagUrl');
  if (!urlInput) return;
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); startDiagnostic(); }
  });
}

/* ==========================================
   5. 진단기 — 시작
========================================== */
function startDiagnostic() {
  const urlInput = document.getElementById('diagUrl');
  const url = urlInput ? urlInput.value.trim() : '';
  if (!url) {
    if (urlInput) {
      urlInput.focus();
      urlInput.style.borderColor = '#EF4444';
      urlInput.placeholder = '홈페이지 주소를 입력해 주세요';
      setTimeout(() => {
        urlInput.style.borderColor = '';
        urlInput.placeholder = 'https://내병원홈페이지.com';
      }, 2400);
    }
    return;
  }
  let finalUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    finalUrl = 'https://' + url;
    if (urlInput) urlInput.value = finalUrl;
  }
  const btn     = document.getElementById('diagSubmitBtn');
  const loading = document.getElementById('diagLoading');
  const result  = document.getElementById('diagResult');
  if (btn)    btn.disabled = true;
  if (result) result.classList.remove('show');
  if (loading) loading.classList.add('show');
  resetStepItems();

  const timeline = [
    { delay: 0,    step: 'dstep1', pct: '18%', text: 'URL 연결 확인 중...' },
    { delay: 600,  step: 'dstep2', pct: '40%', text: '홈페이지 구조 수집 중...' },
    { delay: 1400, step: 'dstep3', pct: '68%', text: 'SEO·AEO·GEO 항목 분석 중...' },
    { delay: 2300, step: 'dstep4', pct: '90%', text: '리포트 생성 중...' },
    { delay: 3200, step: null,     pct: '100%', text: '분석 완료!', done: true }
  ];
  timeline.forEach(({ delay, step, pct, text, done }) => {
    setTimeout(() => {
      setProgram(pct, text);
      if (step) activateStep(step);
      if (done) showResult(finalUrl);
    }, delay);
  });
}

function resetStepItems() {
  ['dstep1','dstep2','dstep3','dstep4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active','done');
  });
  setProgram('0%', '분석 준비 중...');
}

function setProgram(pct, text) {
  const bar   = document.getElementById('diagProgBar');
  const pctEl = document.getElementById('diagProgPct');
  const txtEl = document.getElementById('diagProgText');
  if (bar)   bar.style.width = pct;
  if (pctEl) pctEl.textContent = pct;
  if (txtEl) txtEl.textContent = text;
}

function activateStep(id) {
  ['dstep1','dstep2','dstep3','dstep4'].forEach(sid => {
    const el = document.getElementById(sid);
    if (!el) return;
    if (el.classList.contains('active')) { el.classList.remove('active'); el.classList.add('done'); }
  });
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

function showResult(url) {
  const loading = document.getElementById('diagLoading');
  const result  = document.getElementById('diagResult');
  const btn     = document.getElementById('diagSubmitBtn');
  const seo = Math.floor(Math.random() * 8) + 18;
  const aeo = Math.floor(Math.random() * 7) + 14;
  const geo = Math.floor(Math.random() * 6) + 16;
  setScore('resSeoScore', 'resSeoBar', seo, 33);
  setScore('resAeoScore', 'resAeoBar', aeo, 30);
  setScore('resGeoScore', 'resGeoBar', geo, 29);
  fillImprovements(seo, aeo, geo);
  if (loading) loading.classList.remove('show');
  if (result)  { result.classList.add('show'); result.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
  if (btn) btn.disabled = false;
}

function setScore(elId, barId, val, max) {
  const el  = document.getElementById(elId);
  const bar = document.getElementById(barId);
  if (el)  el.innerHTML = `${val}<small>/${max}</small>`;
  if (bar) bar.style.width = `${(val / max) * 100}%`;
}

function fillImprovements(seo, aeo, geo) {
  const allTips = {
    seo: [
      'meta description 태그가 없거나 너무 짧습니다. 150자 내외로 최적화하세요.',
      '이미지 alt 텍스트가 누락되어 있습니다. 모든 이미지에 설명 텍스트를 추가하세요.',
      '모바일 최적화(viewport 설정)가 미흡합니다. 반응형 레이아웃을 적용하세요.',
      '페이지 제목(title) 태그가 중복 사용되고 있습니다.',
      'H1 태그가 없거나 여러 개 사용되고 있습니다.'
    ],
    aeo: [
      'FAQ 구조(스키마 마크업)가 없습니다. FAQ 페이지를 추가하고 schema.org를 적용하세요.',
      '정의형 문장이 부족합니다. "임플란트란?", "교정이란?" 형식의 설명을 추가하세요.',
      'JSON-LD 구조화 데이터가 적용되지 않았습니다.',
      '진료 안내 텍스트가 너무 짧아 AI가 인용하기 어렵습니다.'
    ],
    geo: [
      '브랜드 정보(LocalBusiness 스키마)가 없습니다. 병원 이름, 주소, 전화번호를 마크업하세요.',
      '저자 정보(author/doctor 정보)가 페이지에 표기되지 않았습니다.',
      '소셜 미디어 프로필 연결이 없어 브랜드 신뢰도가 낮습니다.',
      '사이트맵(sitemap.xml)이 없거나 업데이트되지 않았습니다.'
    ]
  };
  const tips = [];
  if (seo < 22) tips.push(allTips.seo[Math.floor(Math.random() * 3)]);
  else          tips.push(allTips.seo[3 + Math.floor(Math.random() * 2)]);
  if (aeo < 18) tips.push(allTips.aeo[0]);
  else          tips.push(allTips.aeo[1 + Math.floor(Math.random() * 2)]);
  tips.push(allTips.geo[Math.floor(Math.random() * allTips.geo.length)]);
  const list = document.getElementById('drpImpList');
  if (!list) return;
  list.innerHTML = '';
  tips.forEach(tip => {
    const li = document.createElement('li');
    li.textContent = tip;
    list.appendChild(li);
  });
}

function resetDiagnostic() {
  const loading  = document.getElementById('diagLoading');
  const result   = document.getElementById('diagResult');
  const urlInput = document.getElementById('diagUrl');
  const btn      = document.getElementById('diagSubmitBtn');
  if (loading)  loading.classList.remove('show');
  if (result)   result.classList.remove('show');
  if (urlInput) urlInput.value = '';
  if (btn)      btn.disabled = false;
  resetStepItems();
}

/* ==========================================
   6. AI 리뷰 생성기 v2 초기화
========================================== */
// --- 상태 ---
const rw2State = {
  writeMode: 'ai',  // 'ai' | 'manual'
  visitType: 'first',
  language:  'ko',
  treatment: null,
  keyword:   null,
  generated: '',
  isCopied:  false,
  isGenerating: false,
  cache: {}
};

// --- 로컬 리뷰 템플릿 (API 실패 fallback / 오프라인 데모용) ---
const RW_TEMPLATES = {
  ko: {
    first: {
      '임플란트':    '처음 방문했는데 원장님이 임플란트 전 과정을 친절하게 설명해 주셔서 안심이 됐어요. 치료 중 통증도 거의 없었고 직원분들도 따뜻하게 맞아주셨습니다. 믿고 맡길 수 있는 치과를 찾았어요!',
      '충치·신경치료':'처음 방문인데 충치를 꼼꼼히 확인해 주시고 통증 없이 빠르게 치료해 주셨어요. 설명도 자세히 해주셔서 다음 치료 계획도 안심이 됩니다.',
      '교정':        '교정 상담을 아주 꼼꼼하게 해주셨어요. 단계별 계획을 자세히 설명해 주셔서 믿음이 갔습니다. 교정 시작은 여기서 하길 잘했어요.',
      '보철·크라운': '보철 치료를 처음 받았는데 선생님이 자연치에 가깝게 맞춰주셔서 만족합니다. 불편한 부분도 꼼꼼히 확인해 주셨어요.',
      '미백·스케일링':'처음 방문이었는데 스케일링을 정말 꼼꼼하게 해주셨어요. 치아 상태 설명과 관리 팁도 알려주셔서 유익했습니다.',
      '전반적 만족':  '처음 방문했는데 직원분들이 굉장히 친절하게 맞아주셔서 편안했어요. 선생님도 꼼꼼하게 진단해 주셔서 믿음이 갔습니다. 앞으로 단골이 될 것 같아요!'
    },
    revisit: {
      '임플란트':    '임플란트 치료 중인데 매번 경과를 꼼꼼하게 확인해 주셔서 안심이 돼요. 치료 과정이 체계적으로 관리되는 느낌이라 만족합니다.',
      '충치·신경치료':'예전에 치료받은 곳인데 다시 왔어요. 항상 친절하고 빠르게 처리해 주셔서 신뢰가 쌓입니다.',
      '교정':        '교정 중인데 정기 방문마다 꼼꼼히 확인해 주시고 사소한 불편도 바로 조정해 주세요. 장기 치료지만 믿고 맡길 수 있어 좋습니다.',
      '보철·크라운': '보철 재방문인데 늘 변화를 꼼꼼히 체크해 주시고, 조정도 빠르게 해주셔서 감사합니다.',
      '미백·스케일링':'정기 스케일링으로 재방문했어요. 매번 친절하고 꼼꼼하게 해주셔서 앞으로도 계속 이용하고 싶어요.',
      '전반적 만족':  '다시 방문했는데 여전히 친절하고 빠른 서비스에 만족합니다. 직원분들이 저를 기억해 주셔서 더 편안했어요.'
    }
  },
  en: {
    first: {
      default: 'I visited for the first time and was very impressed. The doctor explained everything clearly and the staff were so kind. The treatment was comfortable with minimal pain. I highly recommend this clinic!'
    },
    revisit: {
      default: 'I\'ve been here before and always have a great experience. The care is thorough and the team is very professional. I feel well taken care of every visit!'
    }
  },
  ja: {
    first: {
      default: '初めて来院しました。スタッフがとても親切で、先生も丁寧に治療の説明をしてくださいました。痛みもほとんどなく、安心して治療を受けることができました。また来院したいです。'
    },
    revisit: {
      default: '再来院しました。いつも丁寧に対応していただき、信頼できるクリニックです。スタッフの方々もとても親切で、毎回安心して通えます。'
    }
  },
  zh: {
    first: {
      default: '第一次来访，工作人员非常热情友好。医生详细说明了治疗方案，让我感到非常放心。整体体验很好，治疗过程几乎无痛，强烈推荐！'
    },
    revisit: {
      default: '再次来访，和以前一样获得了很好的服务。医生和工作人员都非常专业，让人感到十分安心。今后还会继续光顾。'
    }
  }
};

// 키워드별 추가 문구
const KW_APPENDS = {
  ko: {
    '친절한 설명':   '선생님이 치료 과정을 정말 친절하게 설명해 주셔서 불안감이 없었어요.',
    '통증 배려':    '치료 중 통증에 세심하게 배려해 주셔서 편안하게 받을 수 있었어요.',
    '과잉진료 없음': '필요한 치료만 설명해 주시고 과잉진료가 없어서 신뢰가 갔어요.',
    '청결·위생':    '병원이 정말 깔끔하고 위생적으로 관리되어 있어서 안심이 됐어요.',
    '합리적 가격':  '치료 비용이 합리적이고 투명하게 안내해 주셔서 좋았어요.',
    '재방문 의향':  '다음에도 꼭 이 치과를 이용하고 싶어요. 강력 추천합니다!'
  }
};

function initReviewWidget() {
  // 작성방식
  document.querySelectorAll('[data-write]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-write]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      rw2State.writeMode = btn.dataset.write;
      onWriteModeChange();
    });
  });

  // 방문유형
  document.querySelectorAll('[data-visit]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-visit]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      rw2State.visitType = btn.dataset.visit;
      rw2TryAutoGenerate();
    });
  });

  // 언어
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      rw2State.language = btn.dataset.lang;
      rw2TryAutoGenerate();
    });
  });

  // 치료
  document.querySelectorAll('[data-treatment]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-treatment]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      rw2State.treatment = btn.dataset.treatment;
      rw2TryAutoGenerate();
    });
  });

  // 경험 키워드
  document.querySelectorAll('[data-keyword]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-keyword]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      rw2State.keyword = btn.dataset.keyword;
      rw2TryAutoGenerate();
    });
  });

  // 복사 버튼
  const copyBtn = document.getElementById('rw2CopyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = document.getElementById('rw2Text')?.value?.trim();
      if (!text) { rw2ShowError('복사할 리뷰 문구가 없습니다.'); return; }
      rw2CopyText(text);
    });
  }

  // 구글 이동 링크 — 복사 안 됐으면 막기
  const googleBtn = document.getElementById('rw2GoogleBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
      const text = document.getElementById('rw2Text')?.value?.trim();
      if (!text) { e.preventDefault(); rw2ShowError('리뷰 문구를 먼저 생성하거나 입력해 주세요.'); return; }
      if (!rw2State.isCopied) { e.preventDefault(); rw2ShowError('리뷰 페이지로 이동하기 전에 문구 복사를 먼저 해주세요.'); return; }
    });
  }

  // textarea 수정 시 isCopied 리셋
  const textarea = document.getElementById('rw2Text');
  if (textarea) {
    textarea.addEventListener('input', () => {
      rw2State.isCopied = false;
      const guide = document.getElementById('rw2CopyGuide');
      if (guide) guide.classList.remove('show');
    });
  }
}

function onWriteModeChange() {
  const aiOpts    = document.getElementById('rw2AiOptions');
  const manGuide  = document.getElementById('rw2ManualGuide');

  if (rw2State.writeMode === 'manual') {
    if (aiOpts)   aiOpts.style.display = 'none';
    if (manGuide) manGuide.classList.add('show');
    rw2OpenManualInput();
  } else {
    if (aiOpts)   aiOpts.style.display = '';
    if (manGuide) manGuide.classList.remove('show');
    rw2CloseResult();
    rw2TryAutoGenerate();
  }
}

function rw2TryAutoGenerate() {
  if (rw2State.writeMode !== 'ai') return;
  if (rw2State.treatment && rw2State.keyword && rw2State.visitType && rw2State.language) {
    rw2GenerateReview();
  }
}

/* ==========================================
   7. 리뷰 생성 — API → fallback 로컬 템플릿
========================================== */
async function rw2GenerateReview() {
  if (rw2State.isGenerating) return;

  const cacheKey = [rw2State.visitType, rw2State.language, rw2State.treatment, rw2State.keyword].join('|');
  if (rw2State.cache[cacheKey]) {
    rw2ShowResult(rw2State.cache[cacheKey], { fromCache: true });
    return;
  }

  rw2State.isGenerating = true;
  rw2ResetResult();

  try {
    // 실제 API 연동 시 아래 fetch를 활성화하고 endpointUrl을 교체하세요
    // const endpointUrl = '/api/review/generate';
    // const res = await fetch(endpointUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     hospital_name: window.REVIEW_CONFIG.hospitalName,
    //     visit_type:    rw2State.visitType,
    //     treatment:     rw2State.treatment,
    //     experience:    rw2State.keyword,
    //     review_language: rw2State.language
    //   })
    // });
    // const data = await res.json();
    // if (!data.success) throw new Error(data.message || '생성 오류');
    // const text = data.review_text || '';

    // ===== 로컬 템플릿 사용 (API 미연동 상태) =====
    const text = await rw2LocalGenerate();
    // =============================================

    if (!text) { rw2CloseResult(); rw2ShowError('리뷰 문구를 생성하지 못했습니다.'); return; }
    rw2State.cache[cacheKey] = text;
    rw2ShowResult(text, { fromCache: false });

  } catch (err) {
    rw2CloseResult();
    rw2ShowError(err.message || '리뷰 생성 중 오류가 발생했습니다.');
  } finally {
    rw2State.isGenerating = false;
  }
}

// 로컬 템플릿으로 문구 생성 (비동기 느낌 유지)
function rw2LocalGenerate() {
  return new Promise(resolve => {
    setTimeout(() => {
      const { language, visitType, treatment, keyword } = rw2State;
      const langPool = RW_TEMPLATES[language] || RW_TEMPLATES.ko;
      const visitPool = langPool[visitType] || langPool['first'] || {};

      let base = visitPool[treatment]
               || visitPool['default']
               || (langPool['first']?.[treatment])
               || (langPool['first']?.['default'])
               || '방문 경험이 정말 좋았습니다. 친절한 직원분들과 꼼꼼한 진료에 감사드립니다.';

      // 한국어 + 경험 키워드 추가 문구 붙이기
      if (language === 'ko' && keyword && KW_APPENDS.ko[keyword]) {
        const already = base.includes(KW_APPENDS.ko[keyword].slice(0, 10));
        if (!already) base = base + ' ' + KW_APPENDS.ko[keyword];
      }

      resolve(base.trim());
    }, 1000); // 1초 딜레이로 AI 생성 느낌
  });
}

/* ==========================================
   8. 리뷰 위젯 UI 상태 관리
========================================== */
function rw2ResetResult() {
  rw2State.isCopied = false;
  const wrap    = document.getElementById('rw2ResultWrap');
  const loading = document.getElementById('rw2Loading');
  const badge   = document.getElementById('rw2Badge');
  const text    = document.getElementById('rw2Text');
  const copyBtn = document.getElementById('rw2CopyBtn');
  const guide   = document.getElementById('rw2CopyGuide');
  const google  = document.getElementById('rw2GoogleBtn');
  const tip     = document.getElementById('rw2Tip');

  if (wrap)    { wrap.classList.add('show'); }
  if (loading) { loading.classList.add('show'); }
  if (badge)   { badge.classList.remove('show'); }
  if (text)    { text.classList.remove('show'); text.value = ''; }
  if (copyBtn) { copyBtn.classList.remove('show', 'copied'); }
  if (guide)   { guide.classList.remove('show'); }
  if (google)  { google.classList.remove('show'); }
  if (tip)     { tip.classList.remove('show'); }

  setTimeout(() => {
    if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 120);
}

function rw2CloseResult() {
  rw2State.isCopied = false;
  const wrap    = document.getElementById('rw2ResultWrap');
  const loading = document.getElementById('rw2Loading');
  const badge   = document.getElementById('rw2Badge');
  const text    = document.getElementById('rw2Text');
  const copyBtn = document.getElementById('rw2CopyBtn');
  const guide   = document.getElementById('rw2CopyGuide');
  const google  = document.getElementById('rw2GoogleBtn');
  const tip     = document.getElementById('rw2Tip');
  const error   = document.getElementById('rw2Error');

  if (wrap)    wrap.classList.remove('show');
  if (loading) loading.classList.remove('show');
  if (badge)   badge.classList.remove('show');
  if (text)    { text.classList.remove('show'); text.value = ''; }
  if (copyBtn) copyBtn.classList.remove('show','copied');
  if (guide)   guide.classList.remove('show');
  if (google)  google.classList.remove('show');
  if (tip)     tip.classList.remove('show');
  if (error)   error.classList.remove('show');
}

function rw2OpenManualInput() {
  rw2State.isCopied = false;
  const wrap    = document.getElementById('rw2ResultWrap');
  const loading = document.getElementById('rw2Loading');
  const badge   = document.getElementById('rw2Badge');
  const text    = document.getElementById('rw2Text');
  const copyBtn = document.getElementById('rw2CopyBtn');
  const google  = document.getElementById('rw2GoogleBtn');
  const tip     = document.getElementById('rw2Tip');
  const guide   = document.getElementById('rw2CopyGuide');

  if (wrap)    wrap.classList.add('show');
  if (loading) loading.classList.remove('show');
  if (badge)   badge.classList.remove('show');
  if (text) {
    text.classList.add('show');
    text.value = '';
    text.placeholder = '실제 방문 경험을 바탕으로 리뷰를 직접 입력해 주세요.';
    setTimeout(() => text.focus(), 120);
  }
  if (copyBtn) copyBtn.classList.add('show');
  if (window.REVIEW_CONFIG?.reviewId && google) google.classList.add('show');
  if (tip) tip.classList.add('show');
  if (guide) guide.classList.remove('show');

  setTimeout(() => {
    if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function rw2ShowResult(resultText, { fromCache } = {}) {
  rw2State.isCopied = false;
  rw2State.generated = resultText;

  const loading = document.getElementById('rw2Loading');
  const badge   = document.getElementById('rw2Badge');
  const text    = document.getElementById('rw2Text');
  const copyBtn = document.getElementById('rw2CopyBtn');
  const google  = document.getElementById('rw2GoogleBtn');
  const tip     = document.getElementById('rw2Tip');

  if (loading) loading.classList.remove('show');
  if (badge) {
    badge.classList.add('show');
    badge.textContent = fromCache ? '저장된 참고 문구' : 'AI 참고 문구';
  }
  if (text) {
    text.classList.add('show');
    text.value = '';
    text.placeholder = 'AI가 생성한 리뷰 문구가 표시됩니다. 자유롭게 수정할 수 있습니다.';
  }

  // 타이핑 효과
  const safeText = resultText || '';
  let i = 0;
  const speed = fromCache ? 3 : 14;
  const typing = setInterval(() => {
    if (!text) { clearInterval(typing); return; }
    text.value += safeText[i];
    text.scrollTop = text.scrollHeight;
    i++;
    if (i >= safeText.length) {
      clearInterval(typing);
      if (copyBtn) copyBtn.classList.add('show');
      if (window.REVIEW_CONFIG?.reviewId && google) google.classList.add('show');
      if (tip) tip.classList.add('show');
    }
  }, speed);
}

/* ==========================================
   9. 복사
========================================== */
function rw2CopyText(text) {
  const doCopy = () => {
    const copyBtn = document.getElementById('rw2CopyBtn');
    const guide   = document.getElementById('rw2CopyGuide');
    rw2State.isCopied = true;
    if (copyBtn) {
      copyBtn.textContent = '복사 완료!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '문구 복사하기';
        copyBtn.classList.remove('copied');
      }, 1800);
    }
    if (guide) guide.classList.add('show');
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(doCopy).catch(() => {
      fallbackCopyRw2(text);
      doCopy();
    });
  } else {
    fallbackCopyRw2(text);
    doCopy();
  }
}

function fallbackCopyRw2(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  Object.assign(ta.style, { position: 'fixed', opacity: '0', left: '0', top: '0' });
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch(_) {}
  document.body.removeChild(ta);
}

function rw2ShowError(msg) {
  const errorEl = document.getElementById('rw2Error');
  if (!errorEl) return;
  errorEl.textContent = msg;
  errorEl.classList.add('show');
  setTimeout(() => errorEl.classList.remove('show'), 3500);
}
