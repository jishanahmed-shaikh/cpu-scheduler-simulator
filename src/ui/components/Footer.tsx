const LINKS = [
  { href: 'https://github.com/jishanahmed-shaikh/cpu-scheduler-simulator', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/jishanahmedshaikh/', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="app__footer">
      <span>
        Crafted by{' '}
        <a href="https://www.jishanahmed.in" target="_blank" rel="noreferrer noopener">
          Mr.&nbsp;JARS
        </a>
      </span>
      {LINKS.map((link) => (
        <span key={link.label}>
          <span className="app__footer-dot" aria-hidden="true">·</span>
          <a href={link.href} target="_blank" rel="noreferrer noopener">
            {link.label}
          </a>
        </span>
      ))}
    </footer>
  );
}
