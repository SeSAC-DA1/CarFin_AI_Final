import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// 각 테스트 후 자동 cleanup
afterEach(() => {
  cleanup();
});

// 글로벌 테스트 설정
global.console = {
  ...console,
  error: (...args: any[]) => {
    // React 18 StrictMode 경고 무시
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    console.error(...args);
  },
};
