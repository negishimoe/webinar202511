const languageMeta = {
  ruby: { label: 'Ruby', areas: ['backend'] },
  python: { label: 'Python', areas: ['backend', 'ai'] },
  php: { label: 'PHP', areas: ['backend'] },
  java: { label: 'Java', areas: ['backend'] },
  javascript: { label: 'JavaScript', areas: ['frontend'] },
  htmlcss: { label: 'HTML&CSS', areas: ['frontend'] },
  sql: { label: 'SQL', areas: ['ai'] },
  aiml: { label: 'AI・機械学習', areas: ['ai'] }
};

const areaLabels = {
  backend: 'バックエンド',
  frontend: 'フロントエンド',
  ai: 'AI・データ分析'
};

const defaultLanguageReasons = {
  ruby: 'RubyはWebサービスの開発で使われ、初学者でも学びやすい構文が特徴です。',
  python: 'Pythonは自動化からAIまで幅広く利用できる汎用言語です。',
  php: 'PHPはWordPressなど多くのWebサイトで使われるサーバーサイド言語です。',
  java: 'Javaは大規模システムで活躍する堅牢な言語です。',
  javascript: 'JavaScriptはUIや動的なWeb機能を作るために必須です。',
  htmlcss: 'HTML&CSSはWebページを形作る基本の技術です。',
  sql: 'SQLはデータベースから必要な情報を取り出すのに欠かせません。',
  aiml: 'AI・機械学習の基礎を押さえると、データを活用した高度な開発が可能になります。'
};

const BASE_POINTS = 3;

const questionWeights = {
  motivation: {
    engineer: {
      areas: ['backend', 'ai'],
      explanation: '業務システムを支える領域を学ぶと即戦力へ近づけます。'
    },
    it: {
      areas: ['ai'],
      languages: ['python'],
      explanation: 'データ基盤の理解はIT業界全般へのアプローチに役立ちます。'
    },
    automation: {
      languages: ['python', 'aiml'],
      explanation: '業務自動化はスクリプトと機械学習の考え方が直結します。'
    },
    side: {
      areas: ['backend'],
      languages: ['javascript'],
      explanation: '副業案件ではWebサービスの受託が多く、堅実なスキルが求められます。'
    },
    hobby: {
      areas: ['backend', 'frontend', 'ai'],
      explanation: '作りたいものに合わせて領域を選べるよう、幅広い基礎力が重要です。'
    }
  },
  goal: {
    freedom: {
      languages: ['ruby', 'python', 'javascript'],
      explanation: 'Webプログラミングスキルで柔軟な働き方を実現します。'
    },
    career: {
      areas: ['ai'],
      languages: ['python'],
      explanation: 'データ分析スキルは多業界で評価され、選択肢を広げます。'
    },
    salary: {
      areas: ['ai'],
      languages: ['ruby', 'php', 'python', 'javascript'],
      explanation: '高単価案件につながるWebバックエンドとAI領域を押さえておくと有利です。'
    },
    skill: {
      languages: ['ruby', 'javascript'],
      explanation: '実務で繰り返し使う構文や設計パターンを磨くとスキルが定着します。'
    },
    joy: {
      languages: ['ruby', 'javascript'],
      explanation: '動きが見える領域を触ることで、継続学習のモチベーションを保ちやすくなります。'
    }
  },
  ability: {
    homepage: {
      areas: ['frontend'],
      explanation: 'ホームページ制作では視覚的な表現と操作性の知識が欠かせません。'
    },
    webservice: {
      areas: ['frontend'],
      languages: ['ruby', 'javascript'],
      explanation: 'フロントからサーバーまで一貫して組めるとWebサービスを素早く形にできます。'
    },
    automationAbility: {
      areas: ['ai'],
      explanation: '業務効率化はデータ処理と分析の力が土台になります。'
    },
    ai: {
      areas: ['ai'],
      languages: ['ruby', 'javascript'],
      explanation: '生成AI開発でもWeb実装とデータ理解の双方が活きます。'
    },
    data: {
      areas: ['ai'],
      explanation: 'データ分析は統計的な視点とモデル化の考え方を養います。'
    }
  }
};

const experienceWeights = {
  none: {
    languages: ['python', 'ruby', 'htmlcss', 'javascript'],
    studyHours: '週10時間〜',
    explanation: '未経験からは扱いやすい文法とWebの基礎に慣れていくのがおすすめです。'
  },
  little: {
    languages: ['python', 'ruby', 'htmlcss', 'javascript'],
    studyHours: '週20時間〜',
    explanation: '触った経験を定着させるために週20時間を目標にアウトプットを増やしましょう。'
  },
  self: {
    areas: ['backend', 'frontend', 'ai'],
    studyHours: '週20時間〜',
    explanation: '独学経験があるなら全領域を横断し、得意分野を伸ばせます。'
  },
  built: {
    areas: ['backend', 'frontend', 'ai'],
    studyHours: '週20時間〜',
    explanation: '作品を作った経験を活かし、実務想定の幅広い領域を押さえましょう。'
  },
  pro: {
    areas: ['backend', 'frontend', 'ai'],
    studyHours: '週20時間〜',
    explanation: '実務経験者はより高度な設計を目指し、全領域をバランス良く伸ばせます。'
  }
};

const form = document.getElementById('questionForm');
const resultCard = document.getElementById('languageResults');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const answers = {
    motivation: data.get('motivation'),
    goal: data.get('goal'),
    ability: data.get('ability'),
    experience: data.get('experience')
  };

  if (Object.values(answers).some((value) => !value)) {
    resultCard.innerHTML = '<p class="error">未回答の質問があります。すべて選択してください。</p>';
    return;
  }

  const { areaScores, languageScores, languageReasons, studyHours } = calculateScores(answers);
  renderResult(areaScores, languageScores, languageReasons, studyHours, answers.ability);
});

function calculateScores(answers) {
  const languageScores = {};
  Object.keys(languageMeta).forEach((lang) => {
    languageScores[lang] = 0;
  });

  const languageReasons = {};

  const applyWeights = (config) => {
    if (!config) return;
    const affected = new Set();
    if (config.areas) {
      config.areas.forEach((area) => {
        addAreaPoints(languageScores, area);
        getLanguageKeysForArea(area).forEach((lang) => affected.add(lang));
      });
    }
    if (config.languages) {
      config.languages.forEach((lang) => {
        addLanguagePoints(languageScores, lang);
        affected.add(lang);
      });
    }
    if (config.explanation) {
      affected.forEach((lang) => addReason(languageReasons, lang, config.explanation));
    }
  };

  applyWeights(questionWeights.motivation[answers.motivation]);
  applyWeights(questionWeights.goal[answers.goal]);
  applyWeights(questionWeights.ability[answers.ability]);
  applyWeights(experienceWeights[answers.experience]);

  const areaScores = { backend: 0, frontend: 0, ai: 0 };
  Object.entries(languageScores).forEach(([lang, score]) => {
    languageMeta[lang].areas.forEach((area) => {
      areaScores[area] += score;
    });
  });

  return {
    areaScores,
    languageScores,
    languageReasons,
    studyHours: experienceWeights[answers.experience]?.studyHours || '週20時間〜'
  };
}

function addAreaPoints(languageScores, area) {
  Object.entries(languageMeta).forEach(([lang, meta]) => {
    if (meta.areas.includes(area)) {
      languageScores[lang] += BASE_POINTS;
    }
  });
}

function addLanguagePoints(languageScores, languageKey) {
  if (!languageScores.hasOwnProperty(languageKey)) return;
  languageScores[languageKey] += BASE_POINTS;
}

function addReason(languageReasons, languageKey, explanation) {
  if (!languageReasons[languageKey]) {
    languageReasons[languageKey] = new Set();
  }
  languageReasons[languageKey].add(explanation);
}

function getLanguageKeysForArea(area) {
  return Object.entries(languageMeta)
    .filter(([, meta]) => meta.areas.includes(area))
    .map(([lang]) => lang);
}

function renderResult(areaScores, languageScores, languageReasons, studyHours, ability) {
  const sortedAreas = Object.entries(areaScores).sort((a, b) => b[1] - a[1]);
  const topArea = sortedAreas[0]?.[0];

  const topAreaLanguages = getLanguagesForArea(topArea, languageScores);
  let recommendedLanguages = topAreaLanguages.length ? topAreaLanguages.slice(0, 3) : [['javascript', languageScores.javascript]];
  recommendedLanguages = enforceBackendLimit(recommendedLanguages);

  const mustHaveSet = new Set(recommendedLanguages.map(([lang]) => lang));
  if (!mustHaveSet.has('javascript')) {
    recommendedLanguages.push(['javascript', languageScores.javascript]);
  }

  recommendedLanguages = enforceBackendLimit(recommendedLanguages);

  const recommendationCards = recommendedLanguages
    .map(([lang]) => {
      const label = languageMeta[lang].label;
      const baseDescription = defaultLanguageReasons[lang] || 'さまざまな現場で活用される言語です。';
      const reasons = languageReasons[lang] ? Array.from(languageReasons[lang]) : [];
      if (!reasons.length) {
        reasons.push('この言語を軸に学ぶと目的に沿ったスキルを磨けます。');
      }
      const reasonHtml = reasons.map((reason) => `<li>${reason}</li>`).join('');
      return `
        <div class="recommend-card">
          <h4>${label}</h4>
          <p class="lang-desc">${baseDescription}</p>
          <ul>${reasonHtml}</ul>
        </div>
      `;
    })
    .join('');

  const courseHtml = getCourseRecommendation(recommendedLanguages.map(([lang]) => lang), ability);

  resultCard.innerHTML = `
    <div class="recommendations">
      <h3>あなたにおすすめの言語</h3>
      <p>以下の言語から学び始めると目的に沿ったスキルを素早く身につけられます。</p>
      <div class="recommendation-grid">
        ${recommendationCards}
      </div>
      ${courseHtml}
      <p class="study">推奨時間：${studyHours}</p>
      <p class="note">※こちらの結果はあくまで目安です。詳細はぜひRUNTEQの無料カウンセリングでご相談ください。</p>
    </div>
  `;
}

function getLanguagesForArea(area, languageScores) {
  if (!area) return [];
  return Object.entries(languageScores)
    .filter(([, score]) => score > 0)
    .filter(([lang]) => languageMeta[lang].areas.includes(area))
    .sort((a, b) => b[1] - a[1]);
}

function enforceBackendLimit(languageList) {
  let backendCount = 0;
  return languageList.filter(([lang]) => {
    const isBackend = languageMeta[lang].areas.includes('backend');
    if (!isBackend) return true;
    if (backendCount >= 2) return false;
    backendCount++;
    return true;
  });
}

function getCourseRecommendation(languageKeys, ability) {
  if (ability === 'automationAbility' || ability === 'data') {
    return `
      <div class="course-card">
        <h4>RUNTEQおすすめコース</h4>
        <p>Python×AIコース</p>
      </div>
    `;
  }

  const courseMap = [
    { key: 'ruby', name: 'Web開発スタンダードコース' },
    { key: 'python', name: 'Python×AIコース' }
  ];

  const hit = courseMap.find((course) => languageKeys.includes(course.key));
  if (!hit) return '';

  return `
    <div class="course-card">
      <h4>RUNTEQおすすめコース</h4>
      <p>${hit.name}</p>
    </div>
  `;
}

// --- スケジュール関連 ---
const calendarContainer = document.getElementById('calendar');
const scheduleForm = document.getElementById('scheduleForm');
const totalHoursEl = document.getElementById('totalHours');
const autoScheduleButton = document.getElementById('autoSchedule');
const days = [
  { key: 'monday', label: '月曜日' },
  { key: 'tuesday', label: '火曜日' },
  { key: 'wednesday', label: '水曜日' },
  { key: 'thursday', label: '木曜日' },
  { key: 'friday', label: '金曜日' },
  { key: 'saturday', label: '土曜日' },
  { key: 'sunday', label: '日曜日' }
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const start = String(i).padStart(2, '0');
  const end = String((i + 1) % 24).padStart(2, '0');
  return `${start}:00-${end}:00`;
});

const scheduleState = days.reduce((acc, day) => {
  acc[day.key] = [];
  return acc;
}, {});

const recommendedPlan = [
  { day: 'monday', slots: ['19:00-20:00', '20:00-21:00'] },
  { day: 'tuesday', slots: ['19:00-20:00', '20:00-21:00'] },
  { day: 'wednesday', slots: ['19:00-20:00', '20:00-21:00'] },
  { day: 'thursday', slots: ['19:00-20:00', '20:00-21:00'] },
  { day: 'friday', slots: ['19:00-20:00', '20:00-21:00'] },
  { day: 'saturday', slots: ['10:00-11:00', '11:00-12:00', '13:00-14:00'] },
  { day: 'sunday', slots: ['10:00-11:00', '11:00-12:00'] }
];

scheduleForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(scheduleForm);
  const day = formData.get('day');
  const timeSlot = formData.get('timeSlot');
  const topic = formData.get('topic');

  if (!day || !timeSlot || !topic) {
    return;
  }

  scheduleState[day].push(createEntry(timeSlot, topic));

  renderCalendar();
  updateTotalHours();
  scheduleForm.reset();
});

autoScheduleButton?.addEventListener('click', () => {
  applyRecommendedSchedule();
  renderCalendar();
  updateTotalHours();
  scheduleForm?.reset();
});

calendarContainer?.addEventListener('click', (event) => {
  const button = event.target;
  if (!(button instanceof HTMLElement)) return;
  if (!button.matches('[data-remove]')) return;

  const day = button.getAttribute('data-day');
  const entryId = button.getAttribute('data-id');

  if (!day || !entryId) return;

  scheduleState[day] = scheduleState[day].filter((item) => item.id !== entryId);
  renderCalendar();
  updateTotalHours();
});

function renderCalendar() {
  if (!calendarContainer) return;
  calendarContainer.innerHTML = days
    .map((day) => {
      const entries = scheduleState[day.key].slice().sort((a, b) => a.orderIndex - b.orderIndex);
      const content = entries.length
        ? entries
            .map(
              (entry) => `
          <div class="schedule-item ${entry.isRecommended ? 'recommended' : ''}" data-entry="${entry.id}">
            <button type="button" data-remove data-day="${day.key}" data-id="${entry.id}" aria-label="削除">×</button>
            <div class="time-row">
              <strong>${entry.time}</strong>
              ${entry.isRecommended ? '<span class="badge">推奨</span>' : ''}
            </div>
            ${entry.topic ? `<p>${entry.topic}</p>` : ''}
          </div>
        `
            )
            .join('')
        : '<p class="note">予定を追加してください。</p>';

      return `
        <div class="day-column" data-day="${day.key}">
          <h3>${day.label}</h3>
          ${content}
        </div>
      `;
    })
    .join('');
}

function updateTotalHours() {
  if (!totalHoursEl) return;
  const hours = calculateWeeklyHours();
  totalHoursEl.textContent = `合計学習時間：${hours}時間`;
}

function calculateWeeklyHours() {
  const parse = (slot) => {
    const [start, end] = slot.split('-');
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return { start: sh * 60 + sm, end: eh * 60 + em };
  };

  let totalMinutes = 0;
  Object.values(scheduleState).forEach((entries) => {
    entries.forEach((entry) => {
      const { start, end } = parse(entry.time);
      const duration = end >= start ? end - start : 0;
      totalMinutes += duration;
    });
  });

  return Math.round(totalMinutes / 60);
}

function applyRecommendedSchedule() {
  // 上書きするので一度クリア
  Object.keys(scheduleState).forEach((key) => {
    scheduleState[key] = [];
  });

  recommendedPlan.forEach((plan) => {
    plan.slots.forEach((slot) => {
      scheduleState[plan.day].push(createEntry(slot, '', true));
    });
  });
}

function createEntry(timeSlot, topic = '', isRecommended = false) {
  const orderIndex = timeSlots.indexOf(timeSlot);
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: timeSlot,
    topic,
    orderIndex: orderIndex === -1 ? 999 : orderIndex,
    isRecommended
  };
}

renderCalendar();
updateTotalHours();
