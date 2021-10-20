import { proxy } from './proxy';

describe('proxy', () => {
  it('should work', () => {
    expect(proxy()).toEqual('proxy');
  });
});
