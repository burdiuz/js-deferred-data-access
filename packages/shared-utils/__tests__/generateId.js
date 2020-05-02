import generateId from './generateId';

describe('generateId()', () => {
  it('Should return string', () => {
    expect(generateId()).to.be.a.string;
  });

  it('Should return unique value', () => {
    expect(generateId()).to.not.be.equal(generateId());
    expect(generateId()).to.not.be.equal(generateId());
  });
});
