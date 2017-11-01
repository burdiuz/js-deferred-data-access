import isResource from './isResource';
import IConvertible from './IConvertible';

export default (data) => (
  isResource(data)
  || typeof data === 'function'
  || data instanceof IConvertible
);
