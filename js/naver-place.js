/* =========================================
   네이버 플레이스 서브페이지 전용 JS
   naver-place.js  — Canvas Pixel Blur v3
   ========================================= */

(function () {
  'use strict';

  /* ============================================================
     Canvas Pixel Blur — 병원명 마스킹
     .np-sc-img-wrap 안의 img 위에 canvas를 올리고,
     data-blur-* 속성에 지정된 영역만 픽셀 블러 처리
     (배경이 비치는 뿌연 효과 — backdrop-filter 미사용)
  ============================================================ */

  function boxBlurH(data, w, h, r) {
    for (var row = 0; row < h; row++) {
      for (var col = 0; col < w; col++) {
        var rs = 0, gs = 0, bs = 0, cnt = 0;
        for (var dx = -r; dx <= r; dx++) {
          var nx = Math.min(w - 1, Math.max(0, col + dx));
          var idx = (row * w + nx) * 4;
          rs += data[idx]; gs += data[idx+1]; bs += data[idx+2]; cnt++;
        }
        var i2 = (row * w + col) * 4;
        data[i2]   = rs / cnt | 0;
        data[i2+1] = gs / cnt | 0;
        data[i2+2] = bs / cnt | 0;
      }
    }
  }

  function boxBlurV(data, w, h, r) {
    for (var col = 0; col < w; col++) {
      for (var row = 0; row < h; row++) {
        var rs = 0, gs = 0, bs = 0, cnt = 0;
        for (var dy = -r; dy <= r; dy++) {
          var ny = Math.min(h - 1, Math.max(0, row + dy));
          var idx = (ny * w + col) * 4;
          rs += data[idx]; gs += data[idx+1]; bs += data[idx+2]; cnt++;
        }
        var i2 = (row * w + col) * 4;
        data[i2]   = rs / cnt | 0;
        data[i2+1] = gs / cnt | 0;
        data[i2+2] = bs / cnt | 0;
      }
    }
  }

  function blurRegion(offCtx, rx, ry, rw, rh, radius, passes) {
    for (var p = 0; p < passes; p++) {
      var d;
      d = offCtx.getImageData(rx, ry, rw, rh);
      boxBlurH(d.data, rw, rh, radius);
      offCtx.putImageData(d, rx, ry);
      d = offCtx.getImageData(rx, ry, rw, rh);
      boxBlurV(d.data, rw, rh, radius);
      offCtx.putImageData(d, rx, ry);
    }
  }

  /* mask 정보를 data 속성에서 읽어 canvas로 blur 적용 */
  function applyBlur(wrap) {
    var img  = wrap.querySelector('img');
    var mask = wrap.querySelector('.np-blur-mask');
    if (!img || !mask) return;

    /* data-* 속성에서 좌표 읽기 (style 속성 fallback) */
    function getPct(attr, styleProp) {
      var v = mask.getAttribute('data-' + attr);
      if (v) return parseFloat(v) / 100;
      v = mask.style[styleProp] || mask.getAttribute('style');
      /* style 속성 직접 파싱 */
      var m = mask.getAttribute('style');
      if (m) {
        var re = new RegExp(styleProp + '\\s*:\\s*([\\d.]+)%');
        var match = m.match(re);
        if (match) return parseFloat(match[1]) / 100;
      }
      return null;
    }

    /* HTML 인라인 style에서 top/left/width/height 파싱
       예) "top:31%;left:53.4%;width:45.6%;height:17.7%"
           "top: 31%; left: 53.4%; width: 45.6%; height: 17.7%;" */
    function parseStyleAttr(mask) {
      /* 먼저 el.style.* 로 읽기 (브라우저가 파싱한 값) */
      var topV    = parseFloat(mask.style.top);
      var leftV   = parseFloat(mask.style.left);
      var widthV  = parseFloat(mask.style.width);
      var heightV = parseFloat(mask.style.height);

      /* el.style.* 로 읽혀도 NaN이면 getAttribute('style') 직접 파싱 */
      if (isNaN(topV) || isNaN(leftV) || isNaN(widthV) || isNaN(heightV)) {
        var styleStr = mask.getAttribute('style') || '';
        function extractPct(str, prop) {
          var re = new RegExp('[\\s;]?' + prop + '\\s*:\\s*([\\d.]+)%', 'i');
          var m = str.match(re);
          if (!m) {
            /* 문자열 시작에서도 찾기 */
            re = new RegExp('^' + prop + '\\s*:\\s*([\\d.]+)%', 'i');
            m = str.match(re);
          }
          return m ? parseFloat(m[1]) : NaN;
        }
        if (isNaN(topV))    topV    = extractPct(styleStr, 'top');
        if (isNaN(leftV))   leftV   = extractPct(styleStr, 'left');
        if (isNaN(widthV))  widthV  = extractPct(styleStr, 'width');
        if (isNaN(heightV)) heightV = extractPct(styleStr, 'height');
      }

      return {
        top:    isNaN(topV)    ? null : topV    / 100,
        left:   isNaN(leftV)   ? null : leftV   / 100,
        width:  isNaN(widthV)  ? null : widthV  / 100,
        height: isNaN(heightV) ? null : heightV / 100
      };
    }

    function doBlur() {
      var natW = img.naturalWidth;
      var natH = img.naturalHeight;
      if (!natW || !natH) {
        console.warn('[blur] naturalSize 0, skip:', img.src);
        return;
      }

      var coords = parseStyleAttr(mask);
      if (coords.top === null || coords.left === null || coords.width === null || coords.height === null) {
        console.warn('[blur] 좌표 파싱 실패:', mask.getAttribute('style'));
        return;
      }

      var rx = Math.round(coords.left   * natW);
      var ry = Math.round(coords.top    * natH);
      var rw = Math.round(coords.width  * natW);
      var rh = Math.round(coords.height * natH);

      /* 범위 클램프 */
      rx = Math.max(0, Math.min(rx, natW - 2));
      ry = Math.max(0, Math.min(ry, natH - 2));
      rw = Math.max(1, Math.min(rw, natW - rx));
      rh = Math.max(1, Math.min(rh, natH - ry));

      console.log('[blur] img:', img.src.split('/').pop(),
        '| nat:', natW+'x'+natH,
        '| region px:', rx, ry, rw, rh);

      /* ── 오프스크린 캔버스에 원본 그리기 ── */
      var offC = document.createElement('canvas');
      offC.width  = natW;
      offC.height = natH;
      var offCtx = offC.getContext('2d', { willReadFrequently: true });

      try {
        offCtx.drawImage(img, 0, 0, natW, natH);
      } catch(e) {
        console.error('[blur] drawImage 실패 (CORS?):', e);
        return;
      }

      /* ── 해당 영역 블러 (3-pass) ── */
      blurRegion(offCtx, rx, ry, rw, rh, 18, 3);

      /* ── 오버레이 캔버스: 블러된 영역만 복사 ── */
      var canvas = document.createElement('canvas');
      canvas.width  = natW;
      canvas.height = natH;
      canvas.style.cssText = [
        'position:absolute',
        'top:0',
        'left:0',
        'width:100%',
        'height:100%',
        'pointer-events:none',
        'z-index:2',
        'display:block'
      ].join(';');

      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, natW, natH);
      ctx.drawImage(offC, rx, ry, rw, rh, rx, ry, rw, rh);

      /* img 바로 뒤(mask 앞)에 삽입 */
      wrap.insertBefore(canvas, mask);
      mask.style.display = 'none';

      console.log('[blur] 완료:', img.src.split('/').pop());
    }

    /* 이미지 완전 로드 대기 */
    if (img.complete && img.naturalWidth > 0) {
      doBlur();
    } else {
      /* complete지만 naturalWidth=0 이면 재시도 */
      var retries = 0;
      var maxRetry = 30; /* 3초 */
      function waitLoaded() {
        if (img.naturalWidth > 0) {
          doBlur();
        } else if (retries < maxRetry) {
          retries++;
          setTimeout(waitLoaded, 100);
        } else {
          console.warn('[blur] 이미지 로드 타임아웃:', img.src);
        }
      }
      img.addEventListener('load', function() {
        setTimeout(doBlur, 50); /* 브라우저 디코딩 완료 대기 */
      }, { once: true });
      img.addEventListener('error', function() {
        console.error('[blur] 이미지 로드 실패:', img.src);
      }, { once: true });
      /* 이미 로딩 중이라면 타이머도 병행 */
      waitLoaded();
    }
  }

  /* ── DOM 준비 후 모든 wrap에 적용 ── */
  function initBlur() {
    document.querySelectorAll('.np-sc-img-wrap').forEach(function(wrap) {
      applyBlur(wrap);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlur);
  } else {
    initBlur();
  }


  /* ===== 탭 전환 ===== */
  var tabs   = document.querySelectorAll('.np-tab');
  var panels = document.querySelectorAll('.np-panel');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;

      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');

      panels.forEach(function(p) {
        p.classList.remove('active');
        p.style.opacity = '0';
      });

      var targetPanel = document.getElementById('tab-' + target);
      if (targetPanel) {
        targetPanel.classList.add('active');
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            targetPanel.style.transition = 'opacity 0.35s ease';
            targetPanel.style.opacity = '1';
          });
        });
        /* 탭 전환 시 해당 패널의 blur 재적용 */
        targetPanel.querySelectorAll('.np-sc-img-wrap').forEach(function(wrap) {
          var existing = wrap.querySelector('canvas');
          if (!existing) applyBlur(wrap);
        });
      }
    });
  });

  var activePanel = document.querySelector('.np-panel.active');
  if (activePanel) activePanel.style.opacity = '1';


  /* ===== 스크롤 진입 애니메이션 ===== */
  if ('IntersectionObserver' in window) {
    var style = document.createElement('style');
    style.textContent = '.np-anim { opacity:0; transform:translateY(28px); transition:opacity .5s ease, transform .5s ease; } .np-visible { opacity:1 !important; transform:translateY(0) !important; }';
    document.head.appendChild(style);

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('np-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.np-diff-card, .np-step, .np-who-card, .np-screenshot-card, .np-caution-item, .np-price-card, .faq-item'
    ).forEach(function(el, i) {
      el.classList.add('np-anim');
      el.style.transitionDelay = (i % 4 * 0.08) + 's';
      observer.observe(el);
    });
  }


  /* ===== Hero 숫자 카운트업 ===== */
  var heroStatsAnimated = false;
  if ('IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !heroStatsAnimated) {
          heroStatsAnimated = true;
          document.querySelectorAll('.np-hero-stat strong').forEach(function(stat) {
            var orig   = stat.textContent.trim();
            var m      = orig.match(/[\d.]+/);
            if (!m) return;
            var final  = parseFloat(m[0]);
            var prefix = orig.slice(0, orig.indexOf(m[0]));
            var suffix = orig.slice(orig.indexOf(m[0]) + m[0].length);
            var isDec  = orig.includes('.');
            var steps  = 40, step = 0, cur = 0;
            var timer  = setInterval(function() {
              step++;
              cur = Math.min(cur + final / steps, final);
              stat.textContent = prefix + (isDec ? cur.toFixed(1) : Math.floor(cur)) + suffix;
              if (step >= steps) clearInterval(timer);
            }, 1200 / steps);
          });
        }
      });
    }, { threshold: 0.5 });

    var heroSection = document.querySelector('.np-hero');
    if (heroSection) heroObserver.observe(heroSection);
  }


  /* ===== Mockup 반짝임 ===== */
  var mockHighlight = document.querySelector('.np-mock-item.highlight');
  if (mockHighlight) {
    setInterval(function() {
      mockHighlight.style.boxShadow = '0 0 0 2px rgba(3,199,90,0.4)';
      setTimeout(function() { mockHighlight.style.boxShadow = ''; }, 800);
    }, 2500);
  }

})();
