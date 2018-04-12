import areProxiesAvailable from '../areProxiesAvailable';

describe('areProxiesAvailable()', () => {
  if (typeof Proxy === 'function') {
    it('should return true when proxies are available', () => {
      expect(areProxiesAvailable()).to.be.true;
    });
  } else {
    it('should return false when proxies are available', () => {
      expect(areProxiesAvailable()).to.be.false;
    });
  }
});
