// Quiz Data
const QUESTIONS = [
  {
    text: '미세플라스틱이 인체에 미치는 영향으로 알려진 것은?',
    choices: ['호르몬 교란', '면역 기능 저하', '장내 미생물 불균형', '모두 해당'],
    answerIndex: 3,
  },
  {
    text: '미세플라스틱이 인체에서 발견되지 않은 부위는?',
    choices: ['혈액', '뼈', '뇌 조직'],
    answerIndex: 1,
  },
  {
    text: '미세플라스틱 섭취 가능성이 가장 높은 식품은?',
    choices: ['신선한 해산물', '익힌 채소', '삶은 달걀'],
    answerIndex: 0,
  },
  {
    text: '먹다 남은 음식을 보관하기에 가장 적합한 용기는?',
    choices: ['지퍼백', '종이 호일', '유리 밀폐용기'],
    answerIndex: 2,
  },
  {
    text: '세탁 시 미세플라스틱 방출량이 가장 많은 옷은?',
    choices: ['새로 산 보송보송 폴리스', '오래된 면 티셔츠', '털실 가득 울 스웨터', '시원한 리넨 셔츠'],
    answerIndex: 0,
  },
  {
    text: '욕실에서 미세플라스틱 발생을 줄이는 방법이 아닌 것은?',
    choices: ['제품 사용량 최소화하기', '고체 샴푸·바디바 사용하기', '플라스틱 용기에 담긴 샴푸, 바디워시 펌핑 쓰기'],
    answerIndex: 2,
  },
  {
    text: '당신이 일주일간 섭취하는 미세플라스틱 양은 어느 정도일까?',
    choices: ['종이 한 장 무게', '신용카드 한 장 무게', '사과 한 개 무게'],
    answerIndex: 1,
  },
];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startForm = document.getElementById('start-form');
const gradeInput = document.getElementById('grade');
const classInput = document.getElementById('class');
const nameInput = document.getElementById('name');
const goRankingBtnStart = document.getElementById('go-ranking-btn-start');

// Grade-class mapping
const GRADE_CLASS_MAP = {
  4: [1, 2, 3, 4, 5],
  5: [1, 2, 3, 4, 5, 6, 7, 8],
  6: [1, 2, 3, 4, 5, 6, 7]
};

const questionText = document.getElementById('question-text');
const questionFigure = document.getElementById('question-figure');
const choicesEl = document.getElementById('choices');
const nextBtn = document.getElementById('next-btn');
const progressEl = document.getElementById('quiz-progress');
const progressFill = document.getElementById('progress-fill');
const userMetaEl = document.getElementById('quiz-user');
const feedbackEl = document.getElementById('feedback');
const explanationEl = document.getElementById('explanation');
const explainFigure = document.getElementById('explain-figure');

const resultSummary = document.getElementById('result-summary');
const resultCard = document.getElementById('result-card');
const rankingList = document.getElementById('ranking-list');
const rankingListStart = null;
const resetRankingBtn = document.getElementById('reset-ranking-btn');
const retryBtn = document.getElementById('retry-btn');
const goRankingBtn = document.getElementById('go-ranking-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const quizBackHomeBtn = document.getElementById('quiz-back-home-btn');
const resetRankingBtnStart = null;
const pageNumbers = document.getElementById('page-numbers');
const pagination = document.getElementById('pagination');

// State
let currentIndex = 0;
let score = 0;
let selectedIndex = null;
let step = 'answer'; // 'answer' -> choose; 'feedback' -> show feedback; 'explain' -> show explanation
let currentPage = 0;
const ITEMS_PER_PAGE = 15;

// Sound effects
function playSoundEffect(isCorrect) {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (isCorrect) {
      // Correct sound - ascending tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else {
      // Incorrect sound - descending tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
      oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.1); // F4
      oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.2); // D4
      
      gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    }
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}

const EXPLANATIONS = [
  '미세플라스틱은 몸속에 들어가서 호르몬을 흔들고, 면역력을 약하게 만들고,\n배 속 균형도 무너뜨려요.\n마치 몸이 "살려줘!"라고 SOS 보내는 것처럼요.',
  '피나 뇌에서도 미세플라스틱이 발견됐는데, 뼈에서는 아직 발견되지 않았어요.\n(그래도 방심하면 안 돼요!)',
  '바다에 버려진 플라스틱을 물고기, 조개가 먹고, 우리가 그걸 먹으면 같이 들어와요.\n"신선한" 해산물에 숨어올 수 있다는 게 무섭죠.',
  '플라스틱 용기 대신 유리 용기를 쓰면 안전해요.\n플라스틱은 시간이 지나면서 작은 조각이 빠져나올 수 있거든요.',
  '합성섬유 옷은 빨래할 때 미세한 조각들이 물로 흘러가요.\n특히 새 옷이 더 많이 빠져나와요.',
  '펌핑형 샴푸, 바디워시는 편리하지만 플라스틱 용기가 계속 쓰여요.\n대신 고체 비누나 샴푸바를 쓰면 플라스틱을 확 줄일 수 있어요.',
  '우리가 일주일 동안 먹는 미세플라스틱 양은 신용카드 한 장 무게 정도래요.\n상상만 해도 깜짝 놀랄 만하죠!',
];
let user = { grade: '', class: '', name: '' };

function showView(view) {
  for (const section of document.querySelectorAll('.view')) {
    section.classList.remove('active');
  }
  view.classList.add('active');
}

function formatUser(userObj) {
  return `${userObj.grade}-${userObj.class} ${userObj.name}`;
}

function renderQuestion() {
  const q = QUESTIONS[currentIndex];
  questionText.textContent = `${currentIndex + 1}. ${q.text}`;
  progressEl.textContent = `${currentIndex + 1} / ${QUESTIONS.length}`;
  userMetaEl.textContent = formatUser(user);
  
  // Update progress bar
  const progressPercent = ((currentIndex + 1) / QUESTIONS.length) * 100;
  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }

  // Set per-question figure (1-7)
  const figures = [
    '1x/quiz1.png',
    '1x/quiz2.png',
    '1x/quiz3.png',
    '1x/quiz4.png',
    '1x/quiz5.png',
    '1x/quiz6.png',
    '1x/quiz7.png',
  ];
  if (questionFigure) {
    questionFigure.src = figures[currentIndex] || '';
    questionFigure.alt = '';
  }

  choicesEl.innerHTML = '';
  selectedIndex = null;
  nextBtn.disabled = true;
  nextBtn.hidden = true;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  explanationEl.hidden = true;
  explanationEl.textContent = '';
  if (explainFigure) explainFigure.hidden = true;
  step = 'answer';

  q.choices.forEach((choiceText, idx) => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.textContent = choiceText;
    button.addEventListener('click', () => onSelect(idx));
    choicesEl.appendChild(button);
  });
  if (explainFigure) explainFigure.hidden = true;
}

function onSelect(idx) {
  selectedIndex = idx;
  // Update UI selection
  const buttons = choicesEl.querySelectorAll('.choice');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });
  
  // Immediately show result and explanation
  const q = QUESTIONS[currentIndex];
  const isCorrect = selectedIndex === q.answerIndex;
  if (isCorrect) score += 1;
  
  // Play sound effect
  playSoundEffect(isCorrect);

  // Mark correct/incorrect
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answerIndex) btn.classList.add('correct');
    else if (i === selectedIndex) btn.classList.add('incorrect');
  });

  // Add end-aligned icon on selected choice
  const selectedBtn = buttons[selectedIndex];
  if (selectedBtn) {
    const indicator = document.createElement('span');
    indicator.className = 'choice-indicator';
    indicator.textContent = selectedIndex === q.answerIndex ? '🟢 정답' : '❌';
    selectedBtn.appendChild(indicator);
  }

  // Add indicator to correct answer if wrong answer was selected
  if (selectedIndex !== q.answerIndex) {
    const correctBtn = buttons[q.answerIndex];
    if (correctBtn) {
      const correctIndicator = document.createElement('span');
      correctIndicator.className = 'choice-indicator';
      correctIndicator.textContent = '🟢 정답';
      correctBtn.appendChild(correctIndicator);
    }
  }

      // Show explanation immediately
      explanationEl.textContent = EXPLANATIONS[currentIndex] || '';
      explanationEl.innerHTML = EXPLANATIONS[currentIndex]?.replace(/\n/g, '<br>') || '';
      explanationEl.hidden = false;
      if (explainFigure) explainFigure.hidden = false;
      
      step = 'explain';
      
      // Show next button
      nextBtn.hidden = false;
      nextBtn.disabled = false;
      
      // Update button text based on current question
      if (currentIndex === QUESTIONS.length - 1) {
        nextBtn.textContent = '결과 보기';
      } else {
        nextBtn.textContent = '다음 문제';
      }
}

function handleNext() {
  if (step === 'explain') {
    currentIndex += 1;
    if (currentIndex < QUESTIONS.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }
}

function finishQuiz() {
  const total = QUESTIONS.length;
  const percent = Math.round((score / total) * 100);
  let message = '';
  if (score === 7) {
    message = '완벽해요! 👏 당신은 미세플라스틱 박사! 🌍';
  } else if (score >= 5) {
    message = '👍 잘했어요! 조금만 더 공부하면 환경 지킴이가 될 수 있어요.';
  } else if (score >= 3) {
    message = '🤔 괜찮아요~ 아직 배울 게 많지만, 시작이 반이에요!';
  } else {
    message = '아쉽지만… 이번 기회에 미세플라스틱에 대해 더 알아보면 어때요? 💡';
  }
  const icon = score === 7 ? '🏅' : '🍀';
  resultSummary.innerHTML = `${user.grade}-${user.class} &nbsp;&nbsp; ${user.name} &nbsp;&nbsp; ${icon}${score}/${total}<br><br><div class="result-divider"></div><br><span class="result-message">${message}</span>`;
  persistRanking({ ...user, score, total, percent, timestamp: Date.now() });
  refreshRanking();
  showView(resultScreen);
}

// Ranking
const STORAGE_KEY = 'mp_quiz_ranking_v1';

function getRanking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

function setRanking(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function persistRanking(entry) {
  const list = getRanking();
  list.push(entry);
  // Sort by score desc, then time asc
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timestamp - b.timestamp;
  });
  // Keep top 100
  setRanking(list.slice(0, 100));
}

function renderRankingInto(target, page = 0) {
  if (!target) return;
  const list = getRanking();
  const startIndex = page * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = list.slice(startIndex, endIndex);
  
  target.innerHTML = '';
  pageItems.forEach((item, index) => {
    const li = document.createElement('li');
    
    const number = document.createElement('span');
    number.className = 'ranking-number';
    number.textContent = startIndex + index + 1;
    
    const name = document.createElement('span');
    name.className = 'ranking-name';
    name.textContent = `${item.grade}-${item.class}    ${item.name}`;
    
    const score = document.createElement('span');
    score.className = 'ranking-score';
    const icon = item.score === 7 ? '🏅' : '🍀';
    score.textContent = `${icon} ${item.score}/${item.total}`;
    
    li.appendChild(number);
    li.appendChild(name);
    li.appendChild(score);
    target.appendChild(li);
  });
  
  // Update pagination
  if (target === rankingList) {
    updatePagination(list.length, currentPage);
  }
}

function updatePagination(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  console.log('updatePagination called:', totalItems, 'items,', totalPages, 'pages, current:', currentPage);
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  pagination.style.display = 'flex';
  pageNumbers.innerHTML = '';
  
  // Show up to 5 page numbers
  const maxVisible = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(0, endPage - maxVisible + 1);
  }
  
  console.log('Creating buttons for pages', startPage + 1, 'to', endPage + 1);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = 'page-number';
    pageBtn.setAttribute('data-page', i);
    pageBtn.style.cssText = 'padding: 0; margin: 0 2px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; min-width: 28px; min-height: 28px; max-width: 28px; max-height: 28px;';
    if (i === currentPage) {
      pageBtn.classList.add('active');
      pageBtn.style.background = '#5b7cff';
      pageBtn.style.color = '#fff';
    }
    pageBtn.textContent = i + 1;
    pageNumbers.appendChild(pageBtn);
  }
  
  // Remove existing event listeners
  pageNumbers.onclick = null;
  
  // Add click handlers directly to each button
  const buttons = pageNumbers.querySelectorAll('.page-number');
  buttons.forEach(btn => {
    btn.onclick = function() {
      const page = parseInt(this.getAttribute('data-page'));
      console.log('Button clicked! Page:', page + 1);
      currentPage = page;
      
      // Force update
      const allRankings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const pageItems = allRankings.slice(startIndex, endIndex);
      
      console.log('Showing items', startIndex, 'to', endIndex - 1);
      
      rankingList.innerHTML = '';
      pageItems.forEach((item, index) => {
        const li = document.createElement('li');
        
        const number = document.createElement('span');
        number.className = 'ranking-number';
        number.textContent = startIndex + index + 1;
        
        const name = document.createElement('span');
        name.className = 'ranking-name';
        name.textContent = `${item.grade}-${item.class}    ${item.name}`;
        
        const score = document.createElement('span');
        score.className = 'ranking-score';
        const icon = item.score === 7 ? '🏅' : '🍀';
        score.textContent = `${icon} ${item.score}/${item.total}`;
        
        li.appendChild(number);
        li.appendChild(name);
        li.appendChild(score);
        rankingList.appendChild(li);
      });
      
      // Update button styles
      buttons.forEach(b => {
        b.style.background = '#fff';
        b.style.color = '#000';
      });
      this.style.background = '#5b7cff';
      this.style.color = '#fff';
    };
  });
}

function refreshRanking() {
  const allRankings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  console.log('refreshRanking called with currentPage:', currentPage, 'total items:', allRankings.length);
  
  // Use existing renderRankingInto function
  renderRankingInto(rankingList, currentPage);
  
  // Don't call updatePagination here - it's already called in renderRankingInto
}

function resetRanking() {
  localStorage.removeItem(STORAGE_KEY);
  refreshRanking();
}

// 욕설 및 부적절한 단어 필터링
const INAPPROPRIATE_WORDS = [
  '바보', '멍청이', '똥', '오줌', '씨발', '개새끼', '지랄', '병신', '좆', '꺼져', '닥쳐',
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'stupid', 'idiot', 'dumb'
];

function containsInappropriateWords(text) {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

function isValidKoreanName(name) {
  // 한글만 허용하는 정규식 (자음, 모음, 완성형 한글)
  const koreanRegex = /^[가-힣]+$/;
  return koreanRegex.test(name);
}

// Event Listeners
startForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const gradeVal = String(gradeInput.value).trim();
  const classVal = String(classInput.value).trim();
  const nameVal = String(nameInput.value).trim();
  
  if (!gradeVal || !classVal || !nameVal) return;
  
  // 이름이 한글인지 확인
  if (!isValidKoreanName(nameVal)) {
    alert('이름은 한글만 입력 가능합니다.');
    nameInput.focus();
    return;
  }
  
  // 이름에 부적절한 단어가 포함되어 있는지 확인
  if (containsInappropriateWords(nameVal)) {
    alert('부적절한 단어가 포함되어 있습니다. 다시 입력해주세요.');
    nameInput.focus();
    return;
  }

  user = { grade: gradeVal, class: classVal, name: nameVal };
  currentIndex = 0;
  score = 0;
  selectedIndex = null;
  renderQuestion();
  showView(quizScreen);
});

if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    startForm.reset();
    showView(startScreen);
  });
}
if (goRankingBtn) {
  goRankingBtn.addEventListener('click', () => {
    refreshRanking();
    showView(resultScreen);
  });
}
if (goRankingBtnStart) {
  goRankingBtnStart.addEventListener('click', () => {
    // Hide result card when going to ranking directly
    if (resultCard) {
      resultCard.style.display = 'none';
    }
    refreshRanking();
    showView(resultScreen);
  });
}
backHomeBtn.addEventListener('click', () => {
  // Show result card when going back to start
  if (resultCard) {
    resultCard.style.display = 'block';
  }
  startForm.reset();
  showView(startScreen);
});
if (quizBackHomeBtn) {
  quizBackHomeBtn.addEventListener('click', () => {
    startForm.reset();
    showView(startScreen);
  });
}
resetRankingBtn.addEventListener('click', () => {
  const input = window.prompt('랭킹을 초기화하려면 비밀번호를 입력하세요.');
  if (input === '2222') {
    resetRanking();
    alert('랭킹이 초기화되었습니다.');
  } else if (input !== null) {
    alert('비밀번호가 올바르지 않습니다.');
  }
});

if (nextBtn) {
  nextBtn.addEventListener('click', handleNext);
}



// Grade selection handler
function updateClassOptions() {
  const selectedGrade = gradeInput.value;
  const classSelect = classInput;
  
  // Clear existing options
  classSelect.innerHTML = '<option value="">반 선택</option>';
  
  if (selectedGrade && GRADE_CLASS_MAP[selectedGrade]) {
    GRADE_CLASS_MAP[selectedGrade].forEach(classNum => {
      const option = document.createElement('option');
      option.value = classNum;
      option.textContent = `${classNum}반`;
      classSelect.appendChild(option);
    });
  }
}

gradeInput.addEventListener('change', updateClassOptions);

// Init
refreshRanking();


