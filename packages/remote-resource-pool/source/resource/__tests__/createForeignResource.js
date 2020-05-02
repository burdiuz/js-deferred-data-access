import RAW_RESOURCE_DATA_KEY from './RAW_RESOURCE_DATA_KEY';
import createForeignResource from './createForeignResource';

class A {
  constructor() {
    this.myValue = 'my-data';
  }
}

describe('createForeignResource()', () => {
  let resource;

  describe('When using with default arguments', () => {
    let data;

    beforeEach(() => {
      resource = createForeignResource();
      data = resource[RAW_RESOURCE_DATA_KEY];
    });

    it('should create an object', () => {
      expect(resource).to.be.ok;
      expect(resource).to.be.an('object');
    });

    it('should contain single property', () => {
      expect(Object.getOwnPropertyNames(resource)).to.have.length(1);
      expect(Object.getOwnPropertySymbols(resource)).to.have.length(0);
      expect(Object.getOwnPropertyNames(resource)[0]).to.be.equal(RAW_RESOURCE_DATA_KEY);
      expect(resource[RAW_RESOURCE_DATA_KEY]).to.be.an('object');
    });

    it('should contain id property', () => {
      expect(data.$id).to.be.a('string');
      expect(data.$id).to.be.ok;
    });

    it('should contain pool id property', () => {
      expect(data.$poolId).to.be.a('string');
      expect(data.$poolId).to.be.ok;
    });

    it('should contain type property', () => {
      expect(data.$type).to.be.equal('object');
    });
  });

  describe('When type is specified', () => {
    beforeEach(() => {
      resource = createForeignResource('my-type');
    });

    it('should use type value in a resource data', () => {
      expect(resource[RAW_RESOURCE_DATA_KEY].$type).to.be.equal('my-type');
    });
  });

  describe('When resource is specified', () => {
    beforeEach(() => {
      resource = createForeignResource('', new A());
    });

    it('should keep original members', () => {
      expect(resource.myValue).to.be.equal('my-data');
    });

    it('should keep object type information', () => {
      expect(resource).to.be.instanceof(A);
    });
  });

  describe('When type and resource are specified', () => {
    beforeEach(() => {
      resource = createForeignResource('fake-resource', new A());
    });

    it('should use type value in a resource data', () => {
      expect(resource[RAW_RESOURCE_DATA_KEY].$type).to.be.equal('fake-resource');
    });

    it('should keep object type information', () => {
      expect(resource).to.be.instanceof(A);
    });
  });
});
