const LINKS = [
  { href: 'https://github.com/jishanahmed-shaikh/cpu-scheduler-simulator', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/jishanahmedshaikh/', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="app__footer">
      <span className="app__footer-credit">
        Crafted by{' '}
        <a href="https://www.jishanahmed.in" target="_blank" rel="noreferrer noopener">
          Mr.&nbsp;JARS
        </a>
      </span>
      <span className="app__footer-links">
        {LINKS.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer noopener">
            {link.label}
          </a>
        ))}
      </span>
    </footer>
  );
}
