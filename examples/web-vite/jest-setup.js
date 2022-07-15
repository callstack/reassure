import { configure } from 'reassure';
import { render, cleanup } from '@testing-library/react';

// Explicitly pass RTL's render and cleanup functions.
configure({ render, cleanup });
