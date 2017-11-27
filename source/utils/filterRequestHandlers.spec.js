import {} from '../../tests/stubs';
import Descriptor, { createDescriptor } from '../command/Descriptor';
import filterRequestHandlers from './filterRequestHandlers';

describe('filterRequestHandlers()', () => {
  let descriptors;
  let properties;

  beforeEach(() => {
    descriptors = {};
    properties = [];
  });
  it('should handle empty values', () => {
    expect(() => {
      filterRequestHandlers(null, descriptors, properties);
      filterRequestHandlers([], descriptors, properties);
      filterRequestHandlers({ some: 'thing' }, descriptors, properties);
    }).to.not.throw(Error);
  });
  describe('When object passed', () => {
    let source;
    beforeEach(() => {
      source = {
        one: 'one',
        two: () => null,
        tree: 3,
      };

      filterRequestHandlers(source, descriptors, properties);
    });
    it('should find all functions', () => {
      expect(Object.getOwnPropertyNames(descriptors)).to.have.length(1);
      expect(descriptors.two).to.be.an.instanceof(Descriptor);
      expect(descriptors.two.propertyName).to.be.equal('two');
      expect(descriptors.two.command).to.be.equal('two');
    });
  });
  describe('When object contains Descriptor', () => {
    let source;
    beforeEach(() => {
      source = {
        one: 'one',
        two: createDescriptor('command', () => null, 'name'),
        tree: 3,
      };

      filterRequestHandlers(source, descriptors, properties);
    });
    it('should keep it unchanged', () => {
      expect(descriptors.two).to.not.be.ok;
      expect(descriptors.name.propertyName).to.be.equal('name');
      expect(descriptors.name.command).to.be.equal('command');
    });
  });
  describe('When array passed', () => {
    let source;
    beforeEach(() => {
      source = ['one', createDescriptor('command', () => null, 'name'), () => null, 3];
      filterRequestHandlers(source, descriptors, properties);
    });
    it('should store Descriptor\'s in result', () => {
      expect(Object.getOwnPropertyNames(descriptors)).to.have.length(1);
      expect(descriptors.name.propertyName).to.be.equal('name');
      expect(descriptors.name.command).to.be.equal('command');
    });
  });
  describe('When using reserved words', () => {
    it('should throw error when reserved word used for property name', () => {
      expect(() => {
        filterRequestHandlers(
          [
            'one',
            createDescriptor('command1', () => null, 'then'),
          ],
          descriptors,
          properties,
        );
      }).to.throw(Error);
    });
  });
  describe('When using dupes', () => {
    it('should throw error when duplicated property name is found', () => {
      expect(() => {
        filterRequestHandlers(
          [
            'one',
            createDescriptor('command1', () => null, 'name'),
            createDescriptor('command2', () => null, 'name'),
            3,
          ],
          descriptors,
          properties,
        );
      }).to.throw(Error);
    });
  });
});
