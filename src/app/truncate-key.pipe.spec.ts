import { TruncateKeyPipe } from './truncate-key.pipe';

describe('TruncateKeyPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateKeyPipe();
    expect(pipe).toBeTruthy();
  });
});
