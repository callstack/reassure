/* eslint-disable react-native/no-raw-text */
import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <picture>
          <source srcSet="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/logo-dark.png" />
          <img
            src="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/logo.png"
            width="400px"
            alt="Reassure"
          />
        </picture>
        <p className={clsx(styles.para)}>Performance testing companion for React and React Native.</p>
        <picture>
          <source srcSet="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/callstack-x-entain-dark.png" />
          <img
            src="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/callstack-x-entain.png"
            width="327px"
            alt="Callstack x Entain"
          />
        </picture>
      </div>
      <div className={clsx('container', styles.buttonContainer)}>
        <Link className={clsx(styles.gettingStartedButton)} to="/docs/introduction">
          Getting started
        </Link>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout title="Welcome" description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
