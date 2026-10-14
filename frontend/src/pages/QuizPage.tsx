import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QUIZ_TOPICS, type QuizTopic } from '../../../shared/questions';
import { TOPICS, type Difficulty, type Question } from '../../../shared/types';
import { CameraStage } from '../components/CameraStage';
import { ChoiceGrid } from '../components/ChoiceGrid';
import { Confetti } from '../components/Confetti';
import { LevelPicker } from '../components/LevelPicker';
import { SpriteScene } from '../components/Sprite';
import { fetchQuestions } from '../lib/api';
import { useQuiz } from '../lib/useQuiz';
import { useSettings } from '../state/settings';

const QUESTIONS_PER_ROUND = 5;

export function QuizPage() {
  const { tr, settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const topic = (QUIZ_TOPICS as readonly string[]).includes(params.get('topic') ?? '')
    ? (params.get('topic') as QuizTopic)
    : null;
  const [level, setLevel] = useState<Difficulty>(1);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [hover, setHover] = useState<{ index: number | null; progress: number }>({ index: null, progress: 0 });

  const loadRound = useCallback(async (t: QuizTopic, d: Difficulty) => {
    setQuestions(null);
    setQuestions(await fetchQuestions(t, d, QUESTIONS_PER_ROUND));
  }, []);

  if (!topic) return <TopicChooser onPick={(t) => setParams({ topic: t })} />;

  return (
    <QuizRound
      key={`${topic}-${level}`}
      topic={topic}
      level={level}
      questions={questions}
      hover={hover}
      setHover={setHover}
      onStart={() => loadRound(topic, level)}
      setLevel={setLevel}
      changeTopic={() => setParams({})}
      lang={settings.lang}
      tr={tr}
    />
  );
}

function TopicChooser({ onPick }: { onPick: (t: QuizTopic) => void }) {
  const { tr, settings } = useSettings();
  return (
    <section>
      <h1>{tr('navQuiz')}</h1>
      <p style={{ fontFamily: 'var(--font-read)' }}>{tr('chooseTopic')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
        {TOPICS.map((topic) => (
          <button key={topic.id} type="button" className="btn" onClick={() => onPick(topic.id as QuizTopic)} style={{ padding: '1.5rem 1rem', fontSize: '0.8rem' }}>
            <SpriteScene groups={[{ sprite: topic.sprite, color: topic.color, count: 1 }]} size={40} />
            <div style={{ marginTop: 8 }}>{topic.title[settings.lang]}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

interface RoundProps {
  topic: QuizTopic;
  level: Difficulty;
  questions: Question[] | null;
  hover: { index: number | null; progress: number };
  setHover: (h: { index: number | null; progress: number }) => void;
  onStart: () => void;
  setLevel: (d: Difficulty) => void;
  changeTopic: () => void;
  lang: 'en' | 'id';
  tr: (k: Parameters<ReturnType<typeof useSettings>['tr']>[0]) => string;
}

function QuizRound(props: RoundProps) {
  const { questions, onStart } = props;
  // Show the level-select intro until the child presses Start (which loads).
  if (!questions) return <Intro {...props} onBegin={onStart} />;
  return <Playing {...props} questions={questions} />;
}

function Intro({ topic, level, setLevel, changeTopic, onBegin, tr }: RoundProps & { onBegin: () => void }) {
  const topicMeta = TOPICS.find((t) => t.id === topic)!;
  const { settings } = useSettings();
  return (
    <section style={{ textAlign: 'center' }}>
      <div className="hero" style={{ marginBottom: '1.5rem' }}>
        <div className="pop" style={{ display: 'inline-block' }}>
          <SpriteScene groups={[{ sprite: topicMeta.sprite, color: topicMeta.color, count: 1 }]} size={64} />
        </div>
        <h1 style={{ fontSize: '1.3rem' }}>{topicMeta.title[settings.lang]}</h1>
        <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.05rem', margin: 0 }}>
          {settings.lang === 'en' ? 'Pick how hard you want it!' : 'Pilih tingkat kesulitannya!'}
        </p>
      </div>
      <LevelPicker value={level} onChange={setLevel} />
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn" onClick={onBegin} style={{ fontSize: '0.9rem', padding: '1em 1.6em' }}>
          ▶ {tr('start')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={changeTopic}>{tr('back')}</button>
      </div>
    </section>
  );
}

function Playing({ questions, hover, setHover, setLevel, level, changeTopic, lang, tr }: RoundProps & { questions: Question[] }) {
  const quiz = useQuiz(questions);
  const { state, current, pick, next, restart } = quiz;

  const onConfirm = useCallback((index: number) => pick(index), [pick]);
  const onHover = useCallback((index: number | null, progress: number) => setHover({ index, progress }), [setHover]);

  // Keyboard: 1-4 or A-D also answer, for kids without a camera.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (state.picked != null || state.done) return;
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx != null && idx < current.choices.length) pick(idx);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.picked, state.done, current, pick]);

  if (state.done) {
    return (
      <section style={{ textAlign: 'center' }}>
        <Confetti fire={state.correctCount >= Math.ceil(quiz.total / 2) ? state.correctCount : 0} />
        <h1>⭐ {state.correctCount}/{quiz.total}</h1>
        <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.2rem' }}>
          {state.correctCount === quiz.total ? tr('posturePerfect') : tr('correct')}
        </p>
        <LevelPicker value={level} onChange={setLevel} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button type="button" className="btn" onClick={restart}>{tr('playAgain')}</button>
          <button type="button" className="btn btn--ghost" onClick={changeTopic}>{tr('back')}</button>
        </div>
      </section>
    );
  }

  const revealed = state.picked != null;
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-pixel)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
        <span>{state.index + 1} / {quiz.total}</span>
        <span>⭐ {state.correctCount}</span>
      </div>

      <h2 style={{ textAlign: 'center' }}>{current.prompt[lang]}</h2>
      {current.visual && (
        <div className="pixel-panel" style={{ margin: '1rem auto', maxWidth: 520 }}>
          <SpriteScene groups={current.visual} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 360px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <CameraStage choiceCount={current.choices.length} onConfirm={onConfirm} onHover={onHover} paused={revealed} />
        <div>
          <p style={{ fontFamily: 'var(--font-read)', textAlign: 'center' }}>{tr('answerWithTap')}</p>
          <ChoiceGrid
            choices={current.choices}
            hovered={hover.index}
            holdProgress={hover.progress}
            picked={state.picked}
            answer={current.answer}
            onPick={pick}
          />
          {revealed && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>
                {state.picked === current.answer ? `✅ ${tr('correct')}` : `❌ ${tr('notQuite')}`}
                {current.explain && ` — ${current.explain[lang]}`}
              </p>
              <button type="button" className="btn" onClick={next} autoFocus>{tr('next')}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
