import IConvertible from './IConvertible';

describe('IConvertible()', () => {
  it('should be instantiable', () => {
    expect(new IConvertible()).to.be.an('object');
  });
});
