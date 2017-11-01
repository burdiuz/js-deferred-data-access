import TARGET_DATA from './TARGET_DATA';
import getRawResource from './getRawResource';

export default (object) => {
  const data = getRawResource(object);
  return data ? data[TARGET_DATA] : null;
};
