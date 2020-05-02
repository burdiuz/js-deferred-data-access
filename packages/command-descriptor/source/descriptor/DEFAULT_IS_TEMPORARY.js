import isResource from '../../utils/isResource';

// It will make all resources temporary and user must explicitly set resource permanent
export default (parent, child) => isResource(child);
