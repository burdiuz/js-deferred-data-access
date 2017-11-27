/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import toJSON from './toJSON';

describe('toJSON()', () => {
  let target;
  let result;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        toJSON: sandbox.stub().returns({}),
      },
    };
    result = toJSON(target);
  });

  it('should call internal function', () => {
    expect(target[TARGET_INTERNALS].toJSON).to.be.calledOnce;
  });

  it('should return call result', () => {
    expect(result).to.be.an('object');
  });

  it('should result with undefined for not a Request target', () => {
    expect(toJSON({})).to.be.undefined;
  });
});
