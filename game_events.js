// ===== 글로벌 상태 및 DOM =====
let currentStage = 0;
const vnText = document.getElementById('vn-text');
const vnChoices = document.getElementById('vn-choices');
const vnWrap = document.getElementById('vn-wrap');
const stats = { trust: 5, indep: 5, comm: 5 };

let vnTypingTimer = null;
let doSkipVnTyping = false;

document.getElementById('vn-wrap').addEventListener('click', (e) => {
  if (e.target.closest('#vn-choices')) return;
  doSkipVnTyping = true;
});

const stageBackgrounds = [
  'radial-gradient(ellipse at bottom, #1e1b4b 0%, #0d0221 60%, #000 100%)',
  'radial-gradient(ellipse at top, #312e81 0%, #1e1b4b 50%, #0d0221 100%)',
  'linear-gradient(160deg, #3f2c23 0%, #1c1917 60%, #0d0907 100%)',
  'linear-gradient(160deg, #172554 0%, #1e3a8a 50%, #0d1f4a 100%)',
  'linear-gradient(160deg, #022c22 0%, #064e3b 50%, #011a15 100%)',
  'linear-gradient(160deg, #451a03 0%, #78350f 50%, #2a1000 100%)',
  'radial-gradient(ellipse at center, #1e1b4b 0%, #0d0221 40%, #000 100%)',
  'linear-gradient(160deg, #2e1065 0%, #4c1d95 50%, #1a0840 100%)'
];

function showVnContent(textHtml, choicesHtml, postRender) {
  clearTimeout(vnTypingTimer);
  doSkipVnTyping = false;
  vnText.innerHTML = '';
  vnChoices.innerHTML = '';
  vnChoices.style.display = 'none';

  const tokens = textHtml.split(/(<[^>]+>)/).filter(x => x);
  let out = [];
  tokens.forEach(t => {
    if (t.startsWith('<')) out.push(t);
    else out.push(...t.split(''));
  });

  let i = 0;
  function next() {
    if (doSkipVnTyping) {
      vnText.innerHTML = textHtml;
      finish();
      return;
    }
    if (i < out.length) {
      vnText.innerHTML = out.slice(0, i + 1).join('');
      i++;
      vnTypingTimer = setTimeout(next, 28);
    } else {
      finish();
    }
  }

  function finish() {
    vnChoices.innerHTML = choicesHtml;
    vnChoices.style.display = 'flex';
    vnChoices.style.opacity = 0;
    // postRender는 DOM이 완전히 갱신된 뒤 실행
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        vnChoices.style.transition = 'opacity 0.5s';
        vnChoices.style.opacity = 1;
        if (postRender) postRender();
      });
    });
  }

  next();
}

// 첫 시작 시 0단계 렌더링
setTimeout(() => renderStage(0), 100);

// ===== 공통 함수 =====
function renderStage(stageNum) {
  vnChoices.style.opacity = 0;
  vnText.style.opacity = 0;

  if (stageNum < stageBackgrounds.length) {
    vnWrap.style.background = stageBackgrounds[stageNum];
    vnWrap.style.transition = 'background 1s ease';
  }

  // 스테이지에 맞게 제누 이미지 필터 교체
  const charImg = document.getElementById('vn-char-img');
  if (stageNum !== 7 && stageNum !== 6) {
    vnWrap.classList.remove('teacher-room-bg');
    vnWrap.classList.remove('art-room-bg');
    if (charImg) {
      charImg.src = 'images/jenu.png';
      charImg.style.display = 'block';
      if (stageNum === 8) {
        charImg.style.filter = 'drop-shadow(0 0 30px rgba(251,191,36,0.5)) brightness(1.1)';
      } else {
        charImg.style.filter = 'drop-shadow(0 0 15px rgba(167,139,250,0.3))';
      }
    }
  }

  setTimeout(() => {
    if (stageNum !== 7) vnText.style.opacity = 1;
    switch (stageNum) {
      case 0: renderStage0(); break;
      case 1: renderStage1(); break;
      case 2: renderStage2(); break;
      case 3: renderStage3(); break;
      case 4: renderStage4(); break;
      case 5: renderStage5(); break;
      case 6: renderStage6(); break;
      case 7: renderStage7(); break;
      case 8: renderStage8(); break;
    }
  }, 400);
}

function applyStats(t, i, c) {
  stats.trust = Math.max(0, Math.min(10, stats.trust + t));
  stats.indep = Math.max(0, Math.min(10, stats.indep + i));
  stats.comm = Math.max(0, Math.min(10, stats.comm + c));

  const vTrust = document.getElementById('v-trust');
  if (vTrust) vTrust.textContent = stats.trust;
  const fTrust = document.getElementById('f-trust');
  if (fTrust) fTrust.style.width = (stats.trust * 10) + '%';

  const vIndep = document.getElementById('v-indep');
  if (vIndep) vIndep.textContent = stats.indep;
  const fIndep = document.getElementById('f-indep');
  if (fIndep) fIndep.style.width = (stats.indep * 10) + '%';

  const vComm = document.getElementById('v-comm');
  if (vComm) vComm.textContent = stats.comm;
  const fComm = document.getElementById('f-comm');
  if (fComm) fComm.style.width = (stats.comm * 10) + '%';
}

function logAction(msg) {
  const item = document.createElement('div');
  item.className = 'log-item';
  item.textContent = msg;
  const list = document.getElementById('log-list');
  if (list) {
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
  }
}

function goNextStage() {
  if (currentStage >= 8) {
    showEnding();
    return;
  }
  currentStage++;

  const stageNames = ['0. 출발', '1. 면접', '2. 가치관', '3. 일상', '4. 소통', '5. 외부', '6. 진실', '7. 위기', '8. 선택'];
  const badge = document.getElementById('stage-badge');
  if (badge) badge.textContent = stageNames[currentStage];

  const progFill = document.getElementById('prog-fill');
  if (progFill) progFill.style.width = (currentStage / 8 * 100) + '%';

  document.querySelectorAll('.prog-label').forEach((l, idx) => {
    l.classList.toggle('active', idx === currentStage);
    l.classList.toggle('done', idx < currentStage);
  });

  logAction(`📍 ${stageNames[currentStage]} 시작!`);
  renderStage(currentStage);
}

// ===== 스테이지 0: 출발 =====
function renderStage0() {
  showVnContent(
    `제누301이 되어, 4년째 이어온 선택의 마지막 순간에 섰어.<br>정답은 없어. 매 순간 진심으로 너의 이야기를 만들어가보자.`,
    `<button class="btn-action" onclick="goNextStage()">면접장으로 이동하기 🚶‍♂️</button>`
  );
}

// ===== 스테이지 1: 면접 - 예비부모 이미지 선택 =====
function renderStage1() {
  showVnContent(
    `오늘 세 팀의 예비부모가 찾아왔어.<br>너는 그동안 수많은 예비부모를 만나왔어. 어떤 이는 정부 혜택만 노렸고, 어떤 이는 형식적인 말만 늘어놨어.<br>오늘은 조금 다른 사람들이 찾아왔다. <b>네가 가장 마음이 가는 사람들은 누구야?</b>`,
    `
      <div class="puzzle-wrap">
        <div class="puzzle-title">🔍 면접을 진행할 예비부모 선택하기 — 이미지를 클릭하세요!</div>
        <div id="parent-grid" style="display:flex; gap:10px; justify-content:center; margin-top:12px; flex-wrap:wrap;">
          <div class="parent-card" onclick="ch1('formal')" id="pc-formal">
            <img src="images/parent_formal.png" alt="형식적 태도형">
            <div class="parent-label">형식적 태도형</div>
            <div class="parent-desc">정해진 멘트만 반복, 정장을 갖춰 입은 사람</div>
          </div>
          <div class="parent-card" onclick="ch1('hana')" id="pc-hana">
            <img src="images/parent_hana.png" alt="하나·해오름형">
            <div class="parent-label">하나 & 해오름</div>
            <div class="parent-desc">준비는 서툴지만 솔직하고 인간적인 사람</div>
          </div>
          <div class="parent-card" onclick="ch1('flashy')" id="pc-flashy">
            <img src="images/parent_flashy.png" alt="혜택 목적형">
            <div class="parent-label">혜택 목적형</div>
            <div class="parent-desc">아이를 예쁜 소유물처럼 대하는 사람</div>
          </div>
        </div>
        <div id="p1-msg" style="text-align:center; margin-top:10px; font-size:0.85rem; height:20px;"></div>
      </div>
    `
  );
}

window.ch1 = function(type) {
  // 선택한 카드 하이라이트
  document.querySelectorAll('.parent-card').forEach(c => c.classList.remove('selected-card'));
  const card = document.getElementById('pc-' + type);
  if (card) card.classList.add('selected-card');

  let resultText = '';
  if (type === 'hana') {
    applyStats(2, 0, 1);
    resultText = '준비는 서툴러도 진심이 느껴지는 하나와 해오름을 골랐어. 이들과 대화하며 마음이 조금 열렸어. (신뢰도·공동체성 상승)';
  } else if (type === 'formal') {
    applyStats(-1, 2, 0);
    resultText = '안정적이지만 기계적인 사람들을 골랐어. 대화는 겉돌았고, 역시 혼자가 편하다고 느꼈어. (자립심 상승, 신뢰도 하락)';
  } else {
    applyStats(-2, 1, -1);
    resultText = '화려한 겉모습 뒤에 정부 혜택만 바라는 속셈을 알아채고 크게 상처받았어. (신뢰도·공동체성 대폭 하락)';
  }
  logAction('👥 ' + resultText);

  setTimeout(() => {
    showVnContent(
      `💭 ${resultText}`,
      `<button class="btn-action" onclick="goNextStage()">다음으로 넘어가기 ▶</button>`
    );
  }, 600);
};

// ===== 스테이지 2: 가치관 =====
function renderStage2() {
  showVnContent(
    `면접이 거듭될수록 어떤 가족이 좋은 가족인지 고민하게 돼.<br>선생님이 물었어. <b>"제누야, 너는 가족이 되기 위해 가장 중요한 게 뭐라고 생각하니?"</b><br>네 솔직한 생각은?`,
    `
      <div class="puzzle-wrap">
        <div class="puzzle-title">💬 너의 가치관은?</div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
          <button class="btn-choice" onclick="ch2('A')">A. 서로 이해하고 맞춰가는 <b>시간과 소통</b></button>
          <button class="btn-choice" onclick="ch2('B')">B. 나를 지켜줄 수 있는 <b>경제적 안정</b></button>
          <button class="btn-choice" onclick="ch2('C')">C. 가족이라면 피가 섞인 <b>진짜 혈연</b>이어야 해</button>
          <button class="btn-choice" onclick="ch2('D')">D. 솔직히 모르겠어. <b>아직 생각해본 적 없어</b></button>
        </div>
      </div>
    `
  );
}

window.ch2 = function(opt) {
  const map = {
    'A': { s: [2, 0, 2], t: '완벽하지 않아도 대화로 풀어나가는 것이 진짜 가족이라고 생각했어. (신뢰도·공동체성 상승)' },
    'B': { s: [0, 3, 0], t: '결국 현실적인 안정이 최우선이야. 스스로 살아남을 힘을 길러야겠다고 다짐했어. (자립심 대폭 상승)' },
    'C': { s: [-1, 1, 0], t: '피가 섞이지 않은 우린 진짜 가족이 될 수 없을지도... 제누는 조심스럽게 거리를 두게 되었어. (신뢰도 하락)' },
    'D': { s: [0, 0, 1], t: '아직 모른다고 솔직하게 말했어. 선생님은 고개를 끄덕이며 "그래도 괜찮아"라고 했어. (공동체성 상승)' }
  };
  const r = map[opt];
  applyStats(...r.s);
  logAction('💭 ' + r.t);
  showVnContent(`💭 ${r.t}`, `<button class="btn-action" onclick="goNextStage()">다음으로 넘어가기 ▶</button>`);
};

// ===== 스테이지 3: 일상 갈등 (식습관) =====
function renderStage3() {
  showVnContent(
    `하나와 해오름과 처음으로 함께 저녁을 먹었어.<br>그런데 너랑 식습관이 너무 달라. 그들은 억지로 맞춰주려 노력하지만, 왠지 분위기가 어색해.<br><b>이 상황에서 어떻게 하지?</b>`,
    `
      <div class="puzzle-wrap">
        <div class="puzzle-title">🍽️ 일상 속 첫 번째 갈등</div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
          <button class="btn-choice" onclick="ch3('A')">A. 솔직하게 내 입맛을 말하고, 같이 맞는 걸 찾아보자고 제안한다.</button>
          <button class="btn-choice" onclick="ch3('B')">B. 일단 무조건 참는다. 티 내지 않는 게 낫겠지.</button>
          <button class="btn-choice" onclick="ch3('C')">C. "안 맞는 것 같아요." 하고 자리를 피해버린다.</button>
          <button class="btn-choice" onclick="ch3('D')">D. 분위기를 깨지 않으려고 억지웃음을 지으며 화제를 돌린다.</button>
        </div>
      </div>
    `
  );
}

window.ch3 = function(opt) {
  const map = {
    'A': { s: [1, 0, 2], t: '서로 다름을 인정하고 대화로 풀었어. "우리 다음엔 제누가 좋아하는 음식 먹자!" 분위기가 훨씬 부드러워졌어.' },
    'B': { s: [-1, -1, 0], t: '억지로 참기만 하다 보니 스트레스가 쌓여갔어. 그들이 차차 눈치챘지만 아무도 먼저 말을 꺼내지 못했어.' },
    'C': { s: [-1, 1, -1], t: '자리를 피하자 어색한 침묵만 맴돌았어. 서로가 서로에게 조심스러워졌어.' },
    'D': { s: [0, 0, -1], t: '억지웃음은 결국 들켰어. 해오름이 조심스럽게 물었어. "제누야, 괜찮아?" 오히려 더 어색해졌어.' }
  };
  const r = map[opt];
  applyStats(...r.s);
  logAction('🍽️ ' + r.t);
  showVnContent(`💭 ${r.t}`, `<button class="btn-action" onclick="goNextStage()">다음으로 넘어가기 ▶</button>`);
};

// ===== 스테이지 4: 소통 (나-전달법) =====
function renderStage4() {
  showVnContent(
    `하나가 또 네 말을 중간에 끊었어. 제누는 기분이 상했어.<br><b>"나-전달법"</b>은 상황→감정→영향→바람 순으로 솔직하게 표현하는 방법이야.<br>이 상황에서 어떻게 말할까?`,
    `
      <div class="puzzle-wrap">
        <div class="puzzle-title">💬 나-전달법으로 감정 표현하기</div>
        <div style="background:rgba(251,191,36,0.1); border:1px solid #fbbf24; border-radius:8px; padding:10px; margin-bottom:12px; font-size:0.8rem; line-height:1.7;">
          📖 <b>나-전달법 공식</b><br>
          ① 상황: "네가 내 말을 끊어서..."<br>
          ② 감정: "나는 서운했어."<br>
          ③ 영향: "그래서 말하기가 어려워졌어."<br>
          ④ 바람: "다음엔 끝까지 들어줘."
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn-choice" onclick="ch4('A')">A. "네가 말을 끊어서 서운했어. 다음엔 끝까지 들어줘."</button>
          <button class="btn-choice" onclick="ch4('B')">B. "왜 맨날 제 말은 안 들어요?!" 화가 치밀어 소리를 지른다.</button>
          <button class="btn-choice" onclick="ch4('C')">C. 아무 말도 안 하고 방으로 들어가 문을 닫는다.</button>
          <button class="btn-choice" onclick="ch4('D')">D. "괜찮아요" 하며 넘어가고 혼자 속으로 삭힌다.</button>
        </div>
      </div>
    `
  );
}

window.ch4 = function(opt) {
  const map = {
    'A': { s: [2, 0, 1], t: '나-전달법으로 솔직하게 표현하자, 하나가 진심으로 사과했어. "고마워, 제누야. 앞으로 잘 들을게." (신뢰도 상승)' },
    'B': { s: [-1, 1, -1], t: '화를 내자 분위기가 싸늘해졌어. 해오름이 사이에서 난감해했고, 그날 저녁은 모두가 조용했어.' },
    'C': { s: [-2, 2, -2], t: '대화를 포기하고 문을 닫았어. 제누의 방에 불이 켜진 채, 세 사람 모두 혼자가 되었어.' },
    'D': { s: [-1, 0, -1], t: '괜찮다고 했지만 표정은 숨겨지지 않았어. 혼자 속으로 삭히는 것, 이제 그만해야 하지 않을까?' }
  };
  const r = map[opt];
  applyStats(...r.s);
  logAction('💬 ' + r.t);
  showVnContent(`💭 ${r.t}`, `<button class="btn-action" onclick="goNextStage()">다음으로 넘어가기 ▶</button>`);
};

// ===== 스테이지 5: 외부 편견 =====
function renderStage5() {
  showVnContent(
    `학교에서 NC 센터 아이들에 대한 근거 없는 소문이 돌기 시작했어.<br>"NC센터 애들은 다 문제 있대." 친구들이 네 앞에서 수군거리는데...<br><b>이 편견에 어떻게 맞설까?</b>`,
    `
      <div class="puzzle-wrap">
        <div class="puzzle-title">💥 편견과의 충돌</div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
          <button class="btn-choice" onclick="ch5('A')">A. 친구들에게 "그거 사실이 아니야"라고 당당하게 반박한다.</button>
          <button class="btn-choice" onclick="ch5('B')">B. 박 선생님께 상담해서 학교 차원의 대응을 요청한다.</button>
          <button class="btn-choice" onclick="ch5('C')">C. "어차피 곧 독립할 거야" 하며 속으로 무시하고 지나간다.</button>
          <button class="btn-choice" onclick="ch5('D')">D. 하나·해오름에게 오늘 있었던 일을 솔직하게 털어놓는다.</button>
        </div>
      </div>
    `
  );
}

window.ch5 = function(opt) {
  const map = {
    'A': { s: [0, 2, 1], t: '용기 있게 반박했어. "내가 NC센터 출신인데, 나 문제 있어 보여?" 친구들이 당황해하며 조용해졌어.' },
    'B': { s: [2, 0, 2], t: '어른과 함께 해결책을 찾았어. 선생님이 전체 학급 앞에서 편견에 대한 이야기를 나눠주셨어. (신뢰도·공동체성 상승)' },
    'C': { s: [-1, 2, -2], t: '마음의 상처를 꾹꾹 눌러 담았어. 겉으론 아무렇지 않은 척했지만, 그날 밤 혼자 많이 울었어.' },
    'D': { s: [1, 0, 2], t: '집에 돌아와 있었던 일을 털어놓자, 하나가 꼭 안아줬어. "우리가 항상 네 편이야." (공동체성 상승)' }
  };
  const r = map[opt];
  applyStats(...r.s);
  logAction('💥 ' + r.t);
  showVnContent(`💭 ${r.t}`, `<button class="btn-action" onclick="goNextStage()">다음으로 넘어가기 ▶</button>`);
};

// ===== 방문 효과음 (Web Audio API) =====
function playDoorSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // 삐걱 소리 합성
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate;
      const freq = 180 + 60 * Math.sin(t * 4) - t * 80;
      d[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 1.2) * 0.35 * (0.9 + Math.random() * 0.1);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.6;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}

function showDoorTransition(callback) {
  playDoorSound();
  const overlay = document.createElement('div');
  overlay.id = 'door-overlay';
  overlay.innerHTML = `
    <div class="door-frame">
      <div class="door-half door-left"></div>
      <div class="door-half door-right"></div>
      <div class="door-text">삐걱—</div>
    </div>
  `;
  document.body.appendChild(overlay);
  // 살짝 후 문 열리는 애니메이션 트리거
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.add('door-open');
    setTimeout(() => {
      overlay.remove();
      if (callback) callback();
    }, 1100);
  }));
}

// ===== 스테이지 6: 미술실 퍼즐 (PAINT 방정식) =====
function renderStage6() {
  vnWrap.classList.add('art-room-bg');
  const charImg = document.getElementById('vn-char-img');
  if (charImg) charImg.style.display = 'none';

  showVnContent(
    `미술실 구석에서 먼지 쌓인 캔버스와 메모를 발견했어.<br>캔버스 밑에 무언가 적혀있는 것 같아... <b>마우스로 페인트를 지워보자!</b>`,
    `
      <div class="puzzle-wrap" style="position:relative;">
        <div class="puzzle-title">🎨 진실의 색채 방정식</div>
        
        <div class="puzzle-scratch-container">
          <canvas id="scratch-canvas"></canvas>
          <div class="scratch-under-content" id="scratch-under">
            <div class="math-puzzle-box">
              <table class="alpha-table" style="margin-bottom:4px;">
                <tr class="l"><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>H</td><td>I</td><td>J</td><td>K</td><td>L</td><td>M</td></tr>
                <tr class="n"><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td></tr>
                <tr class="l"><td>N</td><td>O</td><td>P</td><td>Q</td><td>R</td><td>S</td><td>T</td><td>U</td><td>V</td><td>W</td><td>X</td><td>Y</td><td>Z</td></tr>
                <tr class="n"><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td></tr>
              </table>
              <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; background:rgba(0,0,0,0.05); padding:4px; border-radius:6px; margin-bottom:6px;">
                <div class="math-eq" style="white-space:nowrap;"><span class="color-dot red"></span>+<span class="color-dot blue"></span>=16</div>
                <div class="math-eq" style="white-space:nowrap;"><span class="color-dot blue"></span>+<span class="color-dot yellow"></span>=1</div>
                <div class="math-eq" style="white-space:nowrap;"><span class="color-dot red"></span>+<span class="color-dot yellow"></span>=9</div>
              </div>
              <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:6px;">
                <div class="math-eq" style="white-space:nowrap;">1.🟣:<span class="color-dot red"></span>+<span class="color-dot blue"></span>=?</div>
                <div class="math-eq" style="white-space:nowrap;">2.🟢:<span class="color-dot blue"></span>+<span class="color-dot yellow"></span>=?</div>
                <div class="math-eq" style="white-space:nowrap;">3.🟠:<span class="color-dot red"></span>+<span class="color-dot yellow"></span>=?</div>
              </div>
              <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px;">
                <div class="math-eq" style="white-space:nowrap;">4.분홍:<span class="color-dot red"></span>+<span class="color-dot white"></span>(2)=?</div>
                <div class="math-eq" style="white-space:nowrap;">5.진홍:<span class="color-dot red"></span>+<span class="color-dot black"></span>(8)=?</div>
              </div>
            </div>
          </div>
          <div class="scratch-instructions" id="scratch-inst">마우스로 페인트를 긁어내세요</div>
        </div>
        
        <div id="paint-lock-area" style="display:none; text-align:center; margin-top:12px;">
          <div style="font-size:0.8rem; color:#fbbf24;">도출된 5자리 알파벳을 입력하세요 (부모 면접의 진짜 의미)</div>
          <div class="password-input-group">
            <input type="text" maxlength="1" class="pwd-char" id="pwd1">
            <input type="text" maxlength="1" class="pwd-char" id="pwd2">
            <input type="text" maxlength="1" class="pwd-char" id="pwd3">
            <input type="text" maxlength="1" class="pwd-char" id="pwd4">
            <input type="text" maxlength="1" class="pwd-char" id="pwd5">
          </div>
          <div id="p6-msg" class="p6-feedback" style="margin-top:8px;"></div>
        </div>
      </div>
    `,
    () => {
      // 캔버스 스크래치 로직
      const canvas = document.getElementById('scratch-canvas');
      const ctx = canvas.getContext('2d');
      const container = document.querySelector('.puzzle-scratch-container');
      
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      
      // 회색/검은색 페인트 채우기
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1f2937';
      for(let i=0; i<80; i++) {
        ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 30, 10);
      }
      
      ctx.globalCompositeOperation = 'destination-out';
      
      let isDrawing = false;
      let erasedPixels = 0;
      let revealed = false;

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
      }

      function scratch(e) {
        if (!isDrawing || revealed) return;
        e.preventDefault();
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();
        
        erasedPixels++;
        if (erasedPixels > 120 && !revealed) {
          checkReveal();
        }
      }

      function checkReveal() {
        revealed = true;
        canvas.style.transition = 'opacity 0.8s';
        canvas.style.opacity = '0';
        document.getElementById('scratch-inst').style.display = 'none';
        setTimeout(() => {
          canvas.style.display = 'none';
          document.getElementById('paint-lock-area').style.display = 'block';
          document.getElementById('pwd1').focus();
        }, 800);
      }

      canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
      canvas.addEventListener('mousemove', scratch);
      canvas.addEventListener('mouseup', () => isDrawing = false);
      canvas.addEventListener('mouseleave', () => isDrawing = false);
      
      canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, {passive:false});
      canvas.addEventListener('touchmove', scratch, {passive:false});
      canvas.addEventListener('touchend', () => isDrawing = false);

      let paintFailCount = 0;

      // 비밀번호 입력 처리
      const pwds = [
        document.getElementById('pwd1'), document.getElementById('pwd2'),
        document.getElementById('pwd3'), document.getElementById('pwd4'),
        document.getElementById('pwd5')
      ];
      pwds.forEach((p, idx) => {
        p.addEventListener('input', () => {
          if (p.value.length === 1 && idx < 4) pwds[idx+1].focus();
          checkPassword();
        });
        p.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && p.value === '' && idx > 0) pwds[idx-1].focus();
        });
      });

      function checkPassword() {
        const val = pwds.map(p => p.value.toUpperCase()).join('');
        if (val.length === 5) {
          if (val === 'PAINT') {
            document.getElementById('p6-msg').className = 'p6-feedback correct';
            document.getElementById('p6-msg').textContent = '✅ 정답입니다! PAINT의 의미를 깨달았습니다.';
            pwds.forEach(p => { p.disabled = true; p.style.borderColor = '#34d399'; });
            applyStats(0, 2, 1); 
            logAction('🎨 연립방정식 해독 성공! 진정한 부모 면접의 의미를 알게 되었습니다.');
            setTimeout(() => {
              showVnContent(
                `메모의 뒷면에는 이런 글이 있었어.<br><b>"PAINT는 부모 면접. 하지만 평가받는 건 우리가 아니라, 부모가 될 자격이 있는지 그들을 시험하는 것이다."</b><br>제누는 선택의 주도권이 자신에게 있음을 깨달았어.`,
                `<button class="btn-action" onclick="goNextStage()">비밀의 방을 나서기 ▶</button>`
              );
            }, 1500);
          } else {
            paintFailCount++;
            const msgEl = document.getElementById('p6-msg');
            msgEl.className = 'p6-feedback wrong';
            if (paintFailCount === 1) {
              msgEl.innerHTML = '❌ 틀렸습니다.<br><span style="font-size:0.75rem; color:#fca5a5;">[힌트 1] 앞의 3글자는 주어진 식에서 바로 알 수 있어요! (16=P, 1=A, 9=I)</span>';
            } else if (paintFailCount === 2) {
              msgEl.innerHTML = '❌ 조금 더 고민해보세요.<br><span style="font-size:0.75rem; color:#fca5a5;">[힌트 2] 뒤의 두 글자를 풀려면 빨간색(🔴)을 알아야 해요. 세 식을 모두 더해보세요!</span>';
            } else {
              msgEl.innerHTML = '❌ 거의 다 왔어요!<br><span style="font-size:0.75rem; color:#fca5a5;">[힌트 3] 🔴+🔵+🟡=13 이므로 🔴=12 입니다. 나머지 두 글자는 N, T겠죠?</span>';
            }
          }
        } else {
          document.getElementById('p6-msg').textContent = '';
        }
      }
    }
  );
}

// ===== 스테이지 7: 박선생님 위기 + 알파벳 시계 퍼즐 (기존 6단계) =====
const CLOCK_LETTERS = ['M','K','T','B','U','D','R','F','Q','E','X','S'];
function renderStage7() {
  showDoorTransition(() => {
    _loadTeacherRoom();
  });
}

function _loadTeacherRoom() {
  vnWrap.classList.remove('art-room-bg');
  vnWrap.classList.add('teacher-room-bg');
  vnWrap.style.background = ''; // Clear inline style to let CSS class take over

  let clockHTML = '<div class="alpha-clock-container">';
  clockHTML += '<div class="clock-face">';
  for (let i = 0; i < 60; i++) {
    const angle = i * 6;
    const isHour = i % 5 === 0;
    clockHTML += `<div class="tick ${isHour ? 'tick-hour' : ''}" style="transform:rotate(${angle}deg)"></div>`;
  }
  for (let i = 0; i < 12; i++) {
    const pos = i + 1;
    const angle = (pos * 30 - 90) * Math.PI / 180;
    const r = 88;
    const x = 50 + r * Math.cos(angle) * 0.43;
    const y = 50 + r * Math.sin(angle) * 0.43;
    const letter = CLOCK_LETTERS[i];
    clockHTML += `<div class="alpha-num" data-pos="${pos}" data-letter="${letter}" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%)">
      <span class="a-letter">${letter}</span>
      <span class="a-pos">${pos}시</span>
    </div>`;
  }
  clockHTML += '<div class="clock-hand hour-hand"></div>';
  clockHTML += '<div class="clock-hand min-hand"></div>';
  clockHTML += '<div class="clock-center-dot"></div>';
  clockHTML += '</div></div>';

  const memoHTML = `
    <div class="wall-memo-note">
      <div class="wall-memo-pin">📌</div>
      <div class="wall-memo-title">병문안 기록</div>
      <div class="wall-memo-line"></div>
      <div class="wall-memo-body">
        <div class="hw-line">날 짜: 2037. 11. 3</div>
        <div class="hw-line">장 소: 박 선생님 사무실</div>
        <div class="hw-line hw-highlight">방문 시각 기록:</div>
        <div class="hw-times">3:00 / 7:00 / 5:00 / 12:00 / 3:00</div>
      </div>
    </div>
  `;

  const charImg = document.getElementById('vn-char-img');
  if (charImg) {
    charImg.style.display = 'none';
  }

  vnWrap.classList.add('teacher-room-bg');
  vnText.style.opacity = 1;

  showVnContent(
    `<span class="sfx-text">삐걱—</span> 조심스럽게 문을 열고 박 선생님 사무실에 들어갔어.<br>벽에 낡은 시계가 걸려있어. 자세히 보니 이상해 — <b>숫자가 아니라 알파벳이 적혀있어.</b><br>책 사이에서 손글씨 메모가 발견됐어. '병문안 기록'이라 적혀있어.`,
    `
      <div class="teacher-room-layout">
        <div class="room-memo-area">
          ${memoHTML}
        </div>
        <div class="room-clock-area">
          <div class="clock-area-label">🕐 벽에 걸린 알파벳 시계</div>
          ${clockHTML}
          <div class="clock-answer-row">
            <span class="answer-label">해독:</span>
            <span id="alpha-display" class="alpha-display">_ _ _ _ _</span>
            <button id="alpha-reset-btn" class="alpha-reset-btn">↩</button>
          </div>
          <div id="p7-msg" class="p6-feedback"></div>
        </div>
      </div>
      <div class="puzzle-wrap" id="p7-choice" style="display:none; margin-top:10px;">
        <div class="puzzle-title">💬 선생님을 돕는 방법은?</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn-choice" onclick="ch7('A')">A. 슬며시 다가가 휴지를 건네고, 선생님 이야기를 들어준다.</button>
          <button class="btn-choice" onclick="ch7('B')">B. 다른 어른(원장님 등)에게 선생님이 힘들어 보인다고 알린다.</button>
          <button class="btn-choice" onclick="ch7('C')">C. 어른들의 일이니 내가 끼어들 일이 아니라고 생각하고 지나간다.</button>
        </div>
      </div>
    `,
    () => {
      let picked = [];

      function refreshDisplay() {
        const el = document.getElementById('alpha-display');
        if (!el) return;
        const filled = picked.join(' ');
        const blanks = '_ '.repeat(5 - picked.length).trim();
        el.textContent = filled + (blanks ? ' ' + blanks : '');
      }

      document.getElementById('alpha-reset-btn').addEventListener('click', () => {
        picked = [];
        refreshDisplay();
        const msg = document.getElementById('p7-msg');
        if (msg) { msg.textContent = ''; msg.className = 'p6-feedback'; }
      });

      document.querySelectorAll('.alpha-num').forEach(el => {
        el.addEventListener('click', () => {
          if (picked.length >= 5) return;
          const letter = el.dataset.letter;
          picked.push(letter);

          el.classList.add('alpha-clicked');
          setTimeout(() => el.classList.remove('alpha-clicked'), 350);

          refreshDisplay();

          if (picked.length === 5) {
            const answer = picked.join('');
            const msg = document.getElementById('p7-msg');
            if (answer === 'TRUST') {
              msg.className = 'p6-feedback correct';
              msg.textContent = '✅ TRUST (믿음)! 선생님께 가장 필요한 건 믿음이었구나.';
              setTimeout(() => {
                document.getElementById('p7-choice').style.display = 'block';
              }, 600);
            } else {
              msg.className = 'p6-feedback wrong';
              msg.innerHTML = `❌ <b>${answer}</b> — 메모의 시각을 시계와 다시 대조해봐!`;
              setTimeout(() => {
                picked = [];
                refreshDisplay();
                msg.textContent = '';
                msg.className = 'p6-feedback';
              }, 2000);
            }
          }
        });
      });
    }
  );
}

window.ch7 = function(opt) {
  const map = {
    'A': { s: [1, 0, 3], t: '제누가 조심스럽게 다가가 휴지를 건넸어. 선생님은 눈물을 닦으며 조용히 웃었어. 말 없는 위로가 더 따뜻할 때도 있어. (공동체성 대폭 상승)' },
    'B': { s: [2, 0, 1], t: '믿을 수 있는 다른 어른에게 상황을 알렸어. 함께 해결하는 것이 더 안전하다는 걸 제누는 알고 있었어. (신뢰도 상승)' },
    'C': { s: [0, 2, -1], t: '그냥 지나쳤어. 어른들의 일이라고 생각했지만... 제누의 발걸음은 한참 동안 무거웠어.' }
  };
  const r = map[opt];
  applyStats(...r.s);
  logAction('🕯️ ' + r.t);
  showVnContent(`💭 ${r.t}`, `<button class="btn-action" onclick="goNextStage()">최종 결정을 향해 ▶</button>`);
};


// ===== 스테이지 8: 최종 선택 (기존 7단계) =====
function renderStage8() {
  showVnContent(
    `마침내, 최종 선택의 날이 밝았어.<br>하나와 해오름이 네게 조심스럽게 손을 내밀었어.<br>NC센터 창문으로 노을이 지고 있어. 제누, 지금 가장 솔직한 네 마음은?`,
    `
      <div class="puzzle-wrap">
        <div class="puzzle-title">🌅 나의 마지막 결심</div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
          <button class="btn-choice" onclick="ch8('A')">A. "상처받을지도 모르지만... 이 사람들을 한 번 믿어볼게."</button>
          <button class="btn-choice" onclick="ch8('B')">B. "고마워요. 하지만 내 인생은 내가 혼자 개척할 거예요."</button>
          <button class="btn-choice" onclick="ch8('C')">C. "부모는 아니어도... 서로 돕는 든든한 어른이 되어줄 수 있나요?"</button>
        </div>
      </div>
    `
  );
}

window.ch8 = function(opt) {
  if (opt === 'A') applyStats(3, 0, 0);
  else if (opt === 'B') applyStats(0, 3, 0);
  else applyStats(0, 0, 3);
  logAction('🌅 최종 선택을 마쳤습니다.');
  goNextStage();
};

// ===== 엔딩 화면 =====
function showEnding() {
  const vw = document.getElementById('vn-wrap');
  if (vw) vw.style.display = 'none';
  const bb = document.querySelector('.bottom-bar');
  if (bb) bb.style.display = 'none';
  const sb = document.querySelector('.sidebar');
  if (sb) sb.style.display = 'none';

  const { trust, indep, comm } = stats;
  const max = Math.max(trust, indep, comm);
  const min = Math.min(trust, indep, comm);
  const balanced = (max - min) <= 2;

  let endingType;
  if (balanced) endingType = 'balanced';
  else if (max === trust) endingType = 'trust';
  else if (max === indep) endingType = 'indep';
  else endingType = 'comm';

  const endings = {
    balanced: {
      emoji: '⚖️', title: '균형 엔딩', color: '#c084fc',
      img: 'ending_balanced.png',
      text: '어떤 하나만이 아닌, 여러 가치가 제누를 지탱해주었어. 가족과 독립, 그리고 연대 속에서 제누는 자신만의 속도로 진짜 삶을 살아갈 거야.'
    },
    trust: {
      emoji: '🏡', title: '새가족 엔딩', color: '#38bdf8',
      img: 'ending_trust.png',
      text: '제누는 하나·해오름과 새로운 가족이 되기로 했어. 완벽하진 않겠지만, 그들이 보여준 진심을 믿고 기꺼이 울타리 안으로 들어가기로 결심했어.'
    },
    indep: {
      emoji: '🚪', title: '자립 엔딩 (원작 결말)', color: '#a78bfa',
      img: 'ending_indep.png',
      text: '제누는 하나·해오름을 부모가 아닌 소중한 어른으로 남기기로 했어. 입양이라는 제도를 거부하고, 스스로 자신의 삶을 개척하기 위해 밖으로 나섰어.'
    },
    comm: {
      emoji: '🤝', title: '연대 엔딩', color: '#34d399',
      img: 'ending_comm.png',
      text: '제누의 선택은 혼자만의 것이 아니었어. 박 선생님처럼 힘들고 외로운 사람들을 외면하지 않으며, NC 센터의 경계를 넘어 더 넓고 튼튼한 연대를 만들어갔어.'
    }
  };

  const e = endings[endingType];
  const endingScreen = document.getElementById('s-ending');
  
  // 배경 이미지 뚜렷하게 보이게 하기
  endingScreen.style.background = `url(${e.img}) no-repeat center center / cover`;
  
  // 1단계: 그림만 먼저 보여줌
  endingScreen.innerHTML = ``;
  endingScreen.classList.add('show');
  setTimeout(() => endingScreen.classList.add('visible'), 50);

  // 2단계: 5초 뒤에 선택 결과창 나타나기
  setTimeout(() => {
    endingScreen.innerHTML = `
      <div id="ending-content-box" style="position:absolute; bottom:clamp(20px, 4vh, 40px); left:50%; transform:translateX(-50%); max-width:600px; width:92%; text-align:center; padding:clamp(16px, 2vh, 24px); background:rgba(0,0,0,0.6); backdrop-filter:blur(12px); border-radius:20px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 40px rgba(0,0,0,0.4); opacity:0; transition: opacity 1s ease;">
        <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:12px;">
          <span style="font-size:1.8rem;">${e.emoji}</span>
          <span style="font-size:1.4rem; font-weight:800; background:linear-gradient(135deg, ${e.color}, #fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${e.title}</span>
        </div>
        <div style="font-size:clamp(0.85rem, 1.8vw, 1rem); line-height:1.6; color:#e2e8f0; margin-bottom:16px; word-break:keep-all;">${e.text}</div>
        <div style="display:flex; justify-content:center; gap:16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.05); padding:10px; border-radius:12px; margin-bottom:16px;">
          <div style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:1.1rem; font-weight:700; color:var(--trust);">${trust}</span><span style="font-size:0.65rem; color:var(--muted); margin-top:2px;">신뢰도</span></div>
          <div style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:1.1rem; font-weight:700; color:var(--indep);">${indep}</span><span style="font-size:0.65rem; color:var(--muted); margin-top:2px;">자립심</span></div>
          <div style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:1.1rem; font-weight:700; color:var(--comm);">${comm}</span><span style="font-size:0.65rem; color:var(--muted); margin-top:2px;">공동체성</span></div>
        </div>
        <button onclick="showReflectionForm()" style="background:linear-gradient(135deg, #fbbf24, #f59e0b); color:#000; border:none; padding:12px 24px; border-radius:99px; cursor:pointer; font-size:1rem; font-weight:800; transition:all 0.3s; width:100%;">오늘의 소감 작성하기 📝</button>
      </div>

      <!-- 3단계: 소감 작성 폼 (초기엔 숨김) -->
      <div id="ending-form-area" style="display:none; position:absolute; bottom:clamp(10px, 2vh, 20px); left:50%; transform:translateX(-50%); max-width:600px; width:92%; max-height:90vh; overflow-y:auto; text-align:center; padding:clamp(12px, 2vh, 16px); background:rgba(0,0,0,0.85); backdrop-filter:blur(12px); border-radius:20px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 40px rgba(0,0,0,0.4);">
        <div style="font-size:1rem; font-weight:800; color:#fbbf24; margin-bottom:10px;">✏️ 오늘의 소감 4문답 (각 10글자 이상 진지하게)</div>
        
        <div style="display:flex; gap:8px; margin-bottom:10px;">
          <input type="text" id="student-class" class="ending-input" placeholder="학번 (예: 3501)" style="flex:1; margin-bottom:0; font-size:0.8rem; padding:8px;">
          <input type="text" id="student-name" class="ending-input" placeholder="이름 (예: 홍길동)" style="flex:1; margin-bottom:0; font-size:0.8rem; padding:8px;">
        </div>
        
        <div style="text-align:left; margin-bottom:8px;">
          <div style="font-size:0.75rem; color:#ccc; margin-bottom:4px;">1. 가장 고민되었던 순간과 내가 생각하는 '가족의 의미'는?</div>
          <textarea id="q1" class="ending-textarea" placeholder="10글자 이상 진지하게 적어주세요..." style="min-height:40px; margin-bottom:0; font-size:0.8rem; padding:6px;"></textarea>
        </div>
        <div style="text-align:left; margin-bottom:8px;">
          <div style="font-size:0.75rem; color:#ccc; margin-bottom:4px;">2. 부모 면접을 마치며 느낀 '부모의 자격'이란?</div>
          <textarea id="q2" class="ending-textarea" placeholder="10글자 이상 진지하게 적어주세요..." style="min-height:40px; margin-bottom:0; font-size:0.8rem; padding:6px;"></textarea>
        </div>
        <div style="text-align:left; margin-bottom:8px;">
          <div style="font-size:0.75rem; color:#ccc; margin-bottom:4px;">3. 나의 엔딩 스탯을 보며, 앞으로 나는 어떤 사람이 되고 싶은가?</div>
          <textarea id="q3" class="ending-textarea" placeholder="10글자 이상 진지하게 적어주세요..." style="min-height:40px; margin-bottom:0; font-size:0.8rem; padding:6px;"></textarea>
        </div>
        <div style="text-align:left; margin-bottom:12px;">
          <div style="font-size:0.75rem; color:#ccc; margin-bottom:4px;">4. 오늘 활동을 통해 새롭게 깨달은 점 자유롭게 남기기</div>
          <textarea id="q4" class="ending-textarea" placeholder="10글자 이상 진지하게 적어주세요..." style="min-height:40px; margin-bottom:0; font-size:0.8rem; padding:6px;"></textarea>
        </div>
        
        <button onclick="submitReflection('${e.title}', ${trust}, ${indep}, ${comm})" class="btn-submit" style="width:100%; padding:10px; font-size:0.9rem;">제출 및 완료하기 📥</button>
      </div>

      <!-- 4단계: 다시 시작 버튼 (초기엔 숨김) -->
      <div id="restart-area" style="display:none; position:absolute; bottom:clamp(20px, 4vh, 40px); left:50%; transform:translateX(-50%); width:92%; text-align:center;">
        <button id="btn-restart" onclick="location.reload()" style="background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:white; padding:12px 32px; border-radius:99px; cursor:pointer; font-size:1rem; font-weight:800; transition:all 0.3s; backdrop-filter:blur(5px); box-shadow:0 10px 40px rgba(0,0,0,0.4);">처음부터 다시 하기 🔄</button>
      </div>
    `;
    
    // 서서히 나타나게 애니메이션
    setTimeout(() => {
      const box = document.getElementById('ending-content-box');
      if(box) box.style.opacity = '1';
    }, 50);
  }, 5000);
}

window.showReflectionForm = function() {
  document.getElementById('ending-content-box').style.display = 'none';
  document.getElementById('ending-form-area').style.display = 'flex';
  document.getElementById('ending-form-area').style.flexDirection = 'column';
};

window.submitReflection = function(endingTitle, trust, indep, comm) {
  const studentClass = document.getElementById('student-class').value.trim();
  const name = document.getElementById('student-name').value.trim();
  const q1 = document.getElementById('q1').value.trim();
  const q2 = document.getElementById('q2').value.trim();
  const q3 = document.getElementById('q3').value.trim();
  const q4 = document.getElementById('q4').value.trim();
  
  if (!studentClass || !name) {
    alert('학번(예: 3501)과 이름을 모두 입력해주세요!');
    return;
  }
  if (q1.length < 10 || q2.length < 10 || q3.length < 10 || q4.length < 10) {
    alert('4개의 질문 모두에 10글자 이상 진지하게 답변을 작성해주세요!');
    return;
  }

  const fullName = `${studentClass} ${name}`;
  const reflection = `[1. 가족의 의미]\n${q1}\n\n[2. 부모의 자격]\n${q2}\n\n[3. 앞으로의 다짐]\n${q3}\n\n[4. 종합 소감]\n${q4}`;

  const btn = document.querySelector('.btn-submit');
  const originalText = btn.innerHTML;
  btn.innerHTML = '선생님께 제출 중... ⏳';
  btn.disabled = true;

  const url = 'https://script.google.com/macros/s/AKfycbwZFXvewISf8O_OIGcpz2rVey6WcrHCQZ3KQRCo99GhPYnsuSS8jJQO5otXXALsMVHDTQ/exec';
  const urlParams = new URLSearchParams();
  urlParams.append('name', fullName); // 기존 하위 호환성 유지
  urlParams.append('studentClass', studentClass);
  urlParams.append('studentName', name);
  urlParams.append('endingTitle', endingTitle);
  urlParams.append('trust', trust);
  urlParams.append('indep', indep);
  urlParams.append('comm', comm);
  urlParams.append('reflection', reflection);

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: urlParams
  }).then(() => {
    alert('성공적으로 선생님께 소감이 제출되었습니다! 🎉 이제 게임을 종료하셔도 됩니다.');
    document.getElementById('ending-form-area').style.display = 'none';
    document.getElementById('restart-area').style.display = 'block';
  }).catch(error => {
    alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    btn.innerHTML = originalText;
    btn.disabled = false;
  });
}
