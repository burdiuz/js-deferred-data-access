import { PropertyName } from "./types";

export enum ReservedPropertyNames {
  THEN = 'then',
  CATCH = 'catch',
}

export const isReservedPropertyName = (name: PropertyName) =>
  name === ReservedPropertyNames.THEN || name === ReservedPropertyNames.CATCH;