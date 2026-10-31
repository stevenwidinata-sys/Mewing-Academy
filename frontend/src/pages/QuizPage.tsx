import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isQuizTopic, type QuizTopic } from '../../../shared/questions';
import { TOPICS, type Difficulty, type Question } from '../../../shared/types';
import { LevelPicker } from '../components/LevelPicker';
import { MewyBuddy } from '../components/MewyBuddy';
import { QuizRunner } from '../components/QuizRunner';
import { SpriteScene } from '../components/Sprite';
import { fetchQuestions } from '../lib/api';
import { useSettings } from '../state/settings';

const QUESTIONS_PER_ROUND = 5;

export function QuizPage() {
  const { tr, settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const raw = params.get('topic');
  const topic: QuizTopic | null = isQuizTopic(raw) ? raw : null;
  const [level, setLevel] = useState<Difficulty>(1);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [round, setRound] = useState(0);

  const start = useCallback(async (t: QuizTopic, d: Difficulty) => {
    setQuestions(await fetchQuestions(t, d, QUESTIONS_PER_ROUND));
    setRound((r) => r + 1);
  }, []);
  const changeLevel = (d: Difficulty) => {
    setLevel(d);
    setQuestions(null);
  };
  const changeTopic = () => {
    setQuestions(null);
    setParams({});
  };

  if (!topic) return <TopicChooser onPick={(t) => setParams({ topic: t })} />;
  const meta = TOPICS.find((t) => t.id === topic)!;

  if (!questions) {
    return (
      <section style={{ textAlign: 'center' }}>
        <div className="hero" style={{ marginBottom: '1.5rem' }}>
          <div className="pop" style={{ display: 'inline-block' }}>
            <SpriteScene groups={[{ sprite: meta.sprite, color: meta.color, count: 1 }]} size={64} />
          </div>
          <h1 style={{ fontSize: '1.3rem' }}>{meta.title[settings.lang]}</h1>
          <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.05rem', margin: 0 }}>
            {settings.lang === 'en' ? 'Pick how hard you want it!' : 'Pilih tingkat kesulitannya!'}
          </p>
        </div>
        <LevelPicker value={level} onChange={changeLevel} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={() => start(topic, level)} style={{ fontSize: '0.9rem', padding: '1em 1.6em' }}>
            ▶ {tr('start')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={changeTopic}>{tr('back')}</button>
        </div>
      </section>
    );
  }

  return (
    <QuizRunner
      key={round}
      questions={questions}
      renderDone={(correct, total) => (
        <>
          <MewyBuddy mood={correct >= total / 2 ? 'happy' : 'sad'} />
          <h1>⭐ {correct}/{total}</h1>
          <LevelPicker value={level} onChange={changeLevel} />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => start(topic, level)}>{tr('playAgain')}</button>
            <button type="button" className="btn btn--ghost" onClick={changeTopic}>{tr('back')}</button>
          </div>
        </>
      )}
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
