import { Link, useParams } from 'react-router-dom';
import { getLessons, type LessonTopic } from '../../../shared/lessons';
import { isQuizTopic } from '../../../shared/questions';
import { TOPICS } from '../../../shared/types';
import { SpriteScene } from '../components/Sprite';
import { useSettings } from '../state/settings';

export function LessonDetailPage() {
  const { tr, settings } = useSettings();
  const { topic } = useParams();

  if (!topic || !isQuizTopic(topic)) {
    return (
      <section>
        <p style={{ fontFamily: 'var(--font-read)' }}>{settings.lang === 'en' ? 'Lesson not found.' : 'Pelajaran tidak ditemukan.'}</p>
        <Link to="/lessons" className="btn">{tr('back')}</Link>
      </section>
    );
  }

  const meta = TOPICS.find((t) => t.id === topic)!;
  const modules = getLessons(topic as LessonTopic);

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <SpriteScene groups={[{ sprite: meta.sprite, color: meta.color, count: 1 }]} size={48} />
        <h1 style={{ margin: 0 }}>{meta.title[settings.lang]}</h1>
      </div>

      {/* Road of modules, connected by a dotted line */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0', position: 'relative' }}>
        {modules.map((m, i) => (
          <div key={m.id} className="card lesson-step" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="lesson-badge">{i + 1}</span>
              <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{m.title[settings.lang]}</h3>
            </div>
            <p style={{ fontFamily: 'var(--font-read)', fontStyle: 'italic', margin: '0 0 0.75rem', opacity: 0.9 }}>
              🎯 {m.goal[settings.lang]}
            </p>
            {m.steps.map((step, si) => (
              <div key={si} style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontFamily: 'var(--font-read)', margin: '0 0 0.5rem' }}>{step.text[settings.lang]}</p>
                {step.visual && (
                  <div className="pixel-panel" style={{ display: 'inline-block', padding: '0.75rem' }}>
                    <SpriteScene groups={step.visual} size={44} />
                  </div>
                )}
                {step.example && (
                  <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--accent)', margin: '0.5rem 0 0' }}>
                    {step.example[settings.lang]}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', background: 'var(--panel-glow)' }}>
        <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem', margin: '0 0 1rem' }}>
          {settings.lang === 'en' ? 'Ready? Now practice what you learned!' : 'Siap? Sekarang latih yang sudah kamu pelajari!'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/quiz?topic=${topic}`} className="btn">✋ {tr('navQuiz')}</Link>
          <Link to="/lessons" className="btn btn--ghost">{tr('back')}</Link>
        </div>
      </div>
    </section>
  );
}
