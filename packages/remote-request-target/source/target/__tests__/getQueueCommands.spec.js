/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import Queue from './Queue';
import getQueueCommands from './getQueueCommands';

describe('getQueueCommands()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {};
    target[TARGET_INTERNALS] = {
      /* queue has format
          [
            {name, command, deferred},
            {name, command, deferred},
            {name, command, deferred},
             ...
          ]
       */
      queue: new Queue([
        { name: 'command1', pack: { type: 'abc' } },
        { name: 'command2', pack: { type: 'def' } },
        { name: 'command3', pack: { type: 'ghi' } },
        { name: 'command4', pack: { type: 'jkl' } },
      ]),
    };
    result = getQueueCommands(target);
  });

  it('should result with command types from queue', () => {
    expect(result).to.be.eql(['command1', 'command2', 'command3', 'command4']);
  });

  it('should result with undefined for not a Request target', () => {
    expect(getQueueCommands({})).to.be.undefined;
  });
});
