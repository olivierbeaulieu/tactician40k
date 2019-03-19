// @flow
export type RosterfileJson = {
  roster: {
    id: string,
    name: string,
    entryId: string,
    costs: {
      cost: {
        costTypeId: string,
        name: 'PL' | 'pts',
        value: number
      }[]
    },
    forces: {
      force: {}[]
    }
  }
};

export type Rule = {
  name: string,
  description: string
};

export type Costs = {
  points: number,
  powerLevel: number
};

export type Category = {
  primary: boolean,
  name: string,
};

export type Characteristic = {
  name: string,
  value: string | number
};

export type Profile = {
  type: string,
  name: string,
  id: string,
  characteristics: Characteristic[]
};

export type Selection = {
  number: number,
  type: string,
  entryId: string,
  id: string,
  name: string,
  costs: Costs,
  categories: Category[],
  selections: Selection[],
  profiles: Profile[],
  rules: Rule[]
};

export type Force = {
  id: string,
  name: string,
  catalogueName: string,
  catalogueRevision: number,
  categories: Category[],
  selections: Selection[]
};

export type Roster = {
  id: string,
  name: string,
  costs: Costs,
  forces: Force[]
};