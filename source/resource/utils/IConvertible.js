import { isResource } from './resourceUtils';

/**
 * Interface for all resource types, these will be treated as resources automatically
 * @interface
 * @alias DataAccessInterface.IConvertible
 */
class IConvertible {

}

export const isResourceConvertible = (data) => (
  isResource(data)
  || typeof data === 'function'
  || data instanceof IConvertible
);

export default IConvertible;
