import getId from './getId';

describe('getId()', () => {
  it('Should return string', () => {
    expect(getId()).to.be.a.string;
  });

  it('Should return unique value', () => {
    expect(getId()).to.not.be.equal(getId());
    expect(getId()).to.not.be.equal(getId());
  });
});
