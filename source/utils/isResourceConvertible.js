import isResource from './isResource';
import IConvertible from './IConvertible';
import Target from '../request/Target';

export default (data) => (
  isResource(data)
  || data instanceof Target
  || typeof data === 'function'
  || data instanceof IConvertible
);
