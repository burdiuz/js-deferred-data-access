import { PropertyName } from "./types";

const DATE_NOW = Date.now() - Math.floor(Math.random() * 1000);
let index = 0;

export enum ReservedPropertyNames {
  THEN = 'then',
  CATCH = 'catch',
}

export const isReservedPropertyName = (name: PropertyName) =>
  name === ReservedPropertyNames.THEN || name === ReservedPropertyNames.CATCH;

export const reject = async (message: string): Promise<never> => {
  throw message;
};

export const createUIDGenerator = (key = '') => {
  const prefix = `${key ? `${key}/` : ''}${DATE_NOW}/`;

  return () => `${prefix}${++index};`;
};

export const generateId = createUIDGenerator();

export class IdOwner {
  constructor(public readonly id: string = generateId()) {}
}