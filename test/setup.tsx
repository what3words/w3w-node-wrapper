import React from 'react';
import { JSDOM } from 'jsdom';
import { render } from '@testing-library/react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result?: any;
  }
}

export function setup(html?: string) {
  const HTML = html || '<!doctype html><html><head></head><body></body></html>';
  const dom = new JSDOM(HTML, {
    resources: 'usable',
    runScripts: 'dangerously',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.window = dom.window as any;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
}

export function renderComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback?: (res: (value: any) => void, rej: (reason?: any) => void) => void
) {
  return new Promise((res, rej) => {
    const Component = () => {
      callback ? callback(res, rej) : res(null);
      return null;
    };
    return render(<Component />);
  });
}
