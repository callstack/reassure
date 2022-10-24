import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  source: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Maintainable',
    source: require('@site/static/img/maintainable.png').default,
    description: <>Write maintainable performance tests for your React Native apps</>,
  },
  {
    title: 'Reliable',
    source: require('@site/static/img/reliable.png').default,
    description: <>Extend your existing RNTL tests into performance tests easily</>,
  },
  {
    title: 'Community Driven',
    source: require('@site/static/img/community_driven.png').default,
    description: <>Supported by React Native community and its core contributors</>,
  },
];

function Feature({ title, source, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={styles.featureSvg} src={source} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <>
      <section className={styles.features}>
        <div className="container">
          <div className="row">
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className={clsx('text--center', styles.recruitmentLink)}>
            {`Like the project? ⚛️ `}
            <a href="https://www.callstack.com/careers?utm_campaign=Senior_RN&utm_source=github&utm_medium=readme">
              Join the team
            </a>
            {` who does amazing stuff for clients and drives React Native Open Source! 🔥`}
            <div className={clsx('text--center', styles.attributionLink)}>
              <a href="https://www.vecteezy.com/free-vector/work-icon-set">Work Icon Set Vectors by Vecteezy</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
