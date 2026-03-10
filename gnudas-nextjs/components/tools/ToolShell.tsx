import type { ReactNode } from 'react';

import styles from './tool-shell.module.css';

type MetaItem = {
  label: string;
  value: string;
};

interface ToolShellProps {
  eyebrow: string;
  title: string;
  description: string;
  badges?: string[];
  meta?: MetaItem[];
  main: ReactNode;
  side?: ReactNode;
}

export function ToolShell({
  eyebrow,
  title,
  main,
}: ToolShellProps) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.eyebrow}>{eyebrow}</div>
            <h1 className={styles.title}>{title}</h1>
          </div>
        </section>

        <section className={styles.contentSingle}>
          <div className={styles.contentMain}>{main}</div>
        </section>
      </div>
    </div>
  );
}

export { styles as toolShellStyles };
