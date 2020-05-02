import Decorator from './Decorator';
import Factory from './Factory';
import ProxyFactory from './ProxyFactory';
import Target from './Target';
import canBeDestroyed from './target/canBeDestroyed';
import destroy from './target/destroy';
import getChildren from './target/getChildren';
import getChildrenCount from './target/getChildrenCount';
import getLastChild from './target/getLastChild';
import getQueueCommands from './target/getQueueCommands';
import getQueueLength from './target/getQueueLength';
import getRawPromise from './target/getRawPromise';
import getStatus from './target/getStatus';
import hadChildPromises from './target/hadChildPromises';
import isActive from './target/isActive';
import isPending from './target/isPending';
import isRequest from './target/isRequest';
import isTemporary from './target/isTemporary';
import send from './target/send';
import setTemporary from './target/setTemporary';
import toJSON from './target/toJSON';

export {
  Decorator,
  Factory,
  ProxyFactory,
  Target,
  canBeDestroyed,
  destroy,
  getChildren,
  getChildrenCount,
  getLastChild,
  getQueueCommands,
  getQueueLength,
  getRawPromise,
  getStatus,
  hadChildPromises,
  isActive,
  isPending,
  isRequest,
  isTemporary,
  send,
  setTemporary,
  toJSON,
};
