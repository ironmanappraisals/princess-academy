'use strict';
// FEELINGS: emotion knowledge and simple social problem-solving. Preschool emotion knowledge predicts later
// social skills and school success (Denham and colleagues), and programmes like PATHS and Al's Pals teach it in
// this order: name feelings, read them from situations, link them to causes, then choose a good way to handle them.
// Some answers end with a prompt to talk with a grown-up, because talking it over together is where much of the
// learning happens.
//   1 which face looks <feeling>?      2 a short story: how does she feel?
//   3 why does she feel that way?      4 what's a good thing to do?      5 more feeling words
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui;
  const FACES = { happy: '😀', sad: '😢', angry: '😠', scared: '😨', surprised: '😮' };
  const MORE = { tired: '😴', worried: '😟', silly: '🤪', yucky: '🤢' };
  const ALL = Object.assign({}, FACES, MORE);
  // feelings that can honestly overlap are never offered together
  const CLOSE = { surprised: ['happy', 'scared'], happy: ['surprised', 'silly'], scared: ['surprised', 'worried'], angry: [], sad: ['worried', 'tired'], worried: ['scared', 'sad'], tired: ['sad'], silly: ['happy'], yucky: [] };
  const STORIES = [
    ['happy', 'The princess got a birthday present she wanted.'], ['happy', 'Her best friend came over to play.'],
    ['happy', 'She found her lost kitten!'], ['sad', 'Her balloon floated far away.'],
    ['sad', 'Her ice cream fell on the ground.'], ['sad', 'Her friend had to move far away.'],
    ['angry', 'Someone knocked down her tower on purpose.'], ['angry', 'Someone grabbed her toy without asking.'],
    ['scared', 'She heard loud thunder in the night.'], ['scared', 'A big dog barked at her.'],
    ['surprised', 'A frog jumped out of her teacup!'], ['surprised', 'She opened the door and it was snowing!']
  ];
  const MORE_STORIES = [
    ['tired', 'The princess danced all day and stayed up very late.'], ['tired', 'She walked all the way up the tallest tower.'],
    ['worried', 'She can\'t find her mom in the busy shop.'], ['worried', 'Tomorrow is her first day at a new school.'],
    ['silly', 'She put a pancake on her head like a hat!'], ['silly', 'She is wearing her shoes on her hands!'],
    ['yucky', 'She smelled some very stinky old socks.'], ['yucky', 'She stepped in squishy mud with bare feet.']
  ];
  const CAUSES = [
    ['🎁', 'got a present', 'happy'], ['🐶', 'got a new puppy', 'happy'], ['🎈', 'her balloon flew away', 'sad'],
    ['🍦', 'her ice cream fell down', 'sad'], ['⛈️', 'heard loud thunder', 'scared'], ['👻', 'saw a scary shadow', 'scared'],
    ['🧸', 'someone took her toy', 'angry'], ['🧱', 'someone knocked over her tower', 'angry'], ['🐸', 'a frog jumped out', 'surprised']
  ];
  const ACTIONS = [
    { s: 'Someone grabbed the princess\'s toy. She feels angry.', good: ['🗣️', 'Say, please give it back'], bad: [['👊', 'Hit him'], ['🧸', 'Grab it back hard']] },
    { s: 'Her balloon floated away. She feels sad.', good: ['🤗', 'Ask for a hug'], bad: [['🦶', 'Kick the wall'], ['😤', 'Yell at everyone']] },
    { s: 'There is loud thunder at night. She feels scared.', good: ['🙋‍♀️', 'Tell a grown-up'], bad: [['🏃‍♀️', 'Run outside'], ['🙊', 'Keep it a secret']] },
    { s: 'Her puzzle is really tricky. She feels angry.', good: ['🌬️', 'Take a big breath and try again'], bad: [['💥', 'Throw the puzzle'], ['😭', 'Give up forever']] },
    { s: 'Her friend is crying. Her friend feels sad.', good: ['🫂', 'Give her a hug'], bad: [['😂', 'Laugh at her'], ['🚶‍♀️', 'Walk away']] },
    { s: 'Someone pushed in front of her in line. She feels angry.', good: ['🗣️', 'Say, it\'s my turn please'], bad: [['👊', 'Push them back'], ['😤', 'Shout at them']] },
    { s: 'She knocked over her friend\'s tower by accident. Her friend feels sad.', good: ['🙏', 'Say sorry and help fix it'], bad: [['🏃‍♀️', 'Run away'], ['🤷‍♀️', 'Say it wasn\'t me']] },
    { s: 'She wants a turn on the swing, but her friend is on it.', good: ['⏳', 'Ask, can I have a turn next?'], bad: [['👐', 'Pull her off'], ['😤', 'Stomp and shout']] }
  ];
  const TALK = {
    happy: 'Tell your grown-up something that makes you happy!',
    sad: 'What helps you feel better when you are sad? Tell your grown-up.',
    angry: 'When we feel angry, we can take a big breath. Try one now: in... and out.',
    scared: 'What can you do when you feel scared? You can hold a grown-up\'s hand.',
    surprised: 'Make your best surprised face for your grown-up!',
    tired: 'What helps you rest when you feel tired?',
    worried: 'When you feel worried, you can tell a grown-up. Who can you tell?',
    silly: 'Make your silliest face for your grown-up!',
    yucky: 'What is the yuckiest thing you can think of? Tell your grown-up!'
  };

  function faceOpts(answer, pool) {
    const others = U.shuffle(pool.filter(f => f !== answer && CLOSE[answer].indexOf(f) < 0)).slice(0, 2);
    return U.shuffle([answer].concat(others)).map(f => ({ html: `<span class="emoji">${ALL[f]}</span>`, correct: f === answer, aria: f }));
  }
  const princessCard = () => U.tag(U.el('div', 'card prompt-card', '<div style="width:7rem;height:8.4rem">' + PA.art.princess(null, 'happy') + '</div>'), 'princess');

  function facesQ(pool) {
    const f = PA.store.pick('feelings', pool, 1, x => 'face:' + x)[0];
    return {
      key: 'face:' + f,
      prompt: `Which face looks ${f}?`,
      choices: faceOpts(f, pool),
      hint: `This face looks ${f}. Tap it.`,
      praise: U.pick([`Yes! That face looks ${f}.`, `That's right, ${f}!`])
    };
  }
  function storyQ(list, pool, i) {
    const si = PA.store.pick('feelings', list.map((_, k) => k), 1, k => 'story:' + list[k][1])[0];
    const [f, story] = list[si];
    const talk = i % 4 === 2;
    return {
      key: 'story:' + story,
      prompt: `${story} How does she feel?`,
      build(stage) { stage.appendChild(princessCard()); },
      choices: faceOpts(f, pool),
      hint: `${story} I think she feels ${f}. Tap the ${f} face.`,
      praise: `Yes, she feels ${f}. ` + (talk ? TALK[f] : U.pick(['You understood her feelings.', 'Good thinking!']))
    };
  }
  function causeQ() {
    const pool = CAUSES.map((_, k) => k);
    const ci = PA.store.pick('feelings', pool, 1, k => 'cause:' + k)[0];
    const right = CAUSES[ci];
    const others = U.shuffle(CAUSES.filter(c => c[2] !== right[2] && CLOSE[right[2]].indexOf(c[2]) < 0)).slice(0, 2);
    const opts = U.shuffle([right].concat(others));
    return {
      key: 'cause:' + ci,
      prompt: `The princess feels ${right[2]}. What happened? Did she... ${U.listWords(opts.map(o => o[1]))}?`,
      build(stage) { stage.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji">${FACES[right[2]]}</span><span class="lbl">${right[2]}</span>`), right[2])); },
      choices: opts.map(o => ({ html: `<span class="emoji">${o[0]}</span><span class="lbl">${o[1]}</span>`, cls: 'act', correct: o === right, aria: o[1] })),
      retry: `She feels ${right[2]}. Which one would make you feel ${right[2]}?`,
      hint: `She ${right[1]}. That would make her feel ${right[2]}. Tap it.`,
      praise: `Yes! She ${right[1]}, so she feels ${right[2]}.`
    };
  }
  function actionQ(i) {
    const ai = PA.store.pick('feelings', ACTIONS.map((_, k) => k), 1, k => 'act:' + k)[0];
    const a = ACTIONS[ai];
    const opts = U.shuffle([a.good].concat(a.bad));
    return {
      key: 'act:' + ai,
      prompt: `${a.s} What's a good thing to do? ${U.listWords(opts.map(o => o[1]))}?`,
      build(stage) { stage.appendChild(princessCard()); },
      choices: opts.map(o => ({ html: `<span class="emoji">${o[0]}</span><span class="lbl">${o[1]}</span>`, cls: 'act', correct: o === a.good, aria: o[1] })),
      retry: 'Which one is kind and safe?',
      hint: `${a.good[1]}. That's kind and safe. Tap it.`,
      praise: `Yes! ${a.good[1]}. That's a kind and safe choice.` + (i % 3 === 1 ? ' Can you think of another good idea? Tell your grown-up!' : '')
    };
  }

  PA.games.push({
    id: 'feelings', name: 'Feelings', icon: '💖', color: '#ffe0e6', maxLevel: 5,
    skill: 'Naming feelings, their causes, and kind choices',
    research: 'Recognising emotions, linking them to causes and choosing calm, kind actions follows the sequence used in PATHS-style social-emotional programmes; preschool emotion knowledge predicts later social skills and school success (Denham). Talking it over together is the key part.',
    levels: ['Faces', 'Stories', 'Why does she feel that way?', 'What\'s a good thing to do?', 'More feeling words'],
    tryAtHome: [
      'Name feelings during the day: "You look frustrated. The puzzle is tricky!"',
      'When reading, ask "How do you think she feels? Why? What could she do?"',
      'Make faces in a mirror together: happy, sad, surprised, worried.',
      'Practise "smell the flower, blow out the candle" breathing when calm, so it\'s ready when upset.'
    ],
    intro: lvl => ['Let\'s learn about feelings!', 'Let\'s listen to stories about the princess!', 'Why does the princess feel that way?',
      'Let\'s help the princess make good choices!', 'Let\'s learn some new feeling words!'][lvl - 1],
    next(api, i, lvl) {
      const base = Object.keys(FACES), all = Object.keys(ALL);
      if (lvl === 1) return facesQ(base);
      if (lvl === 2) return storyQ(STORIES, base, i);
      if (lvl === 3) return causeQ();
      if (lvl === 4) return actionQ(i);
      return Math.random() < 0.4 ? facesQ(Object.keys(MORE).concat(['happy', 'sad', 'angry'])) : storyQ(MORE_STORIES.concat(STORIES), all, i);
    }
  });
})();
