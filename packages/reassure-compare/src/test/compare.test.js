import { loadFile } from '../compare';

describe('Tests for compare method', () => {
  it('When loadFile is called with valid file data it should return valid parsed information', async () => {
    const res = await loadFile(`${__dirname}/current.correct.perf`);
    expect(res).toMatchSnapshot();
  });
  it('When loadFile is called with multiple metadata header entries then parsing should fail', async () => {
    try {
      await loadFile(`${__dirname}/current.incorrect.headers.perf`);
    } catch (e) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toMatchSnapshot();
    }
  });
});
