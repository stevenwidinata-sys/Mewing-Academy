// A topic's emoji inside a small shaded pixel tile.
export function TopicIcon({ emoji, size = 40 }: { emoji: string; size?: number }) {
  return (
    <span className="topic-icon" aria-hidden="true" style={{ width: size, height: size, fontSize: size * 0.6 }}>
      {emoji}
    </span>
  );
}
