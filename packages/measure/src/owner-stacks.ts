import { disableOwnerStacks } from 'react-test-config';

let hasDisabledOwnerStacks = false;

export function disableOwnerStacksIfNeeded() {
  if (hasDisabledOwnerStacks) {
    return;
  }

  disableOwnerStacks();
  hasDisabledOwnerStacks = true;
}
