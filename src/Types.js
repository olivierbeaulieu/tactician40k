// @flow
export type RosterfileJson = {
  roster: {
    id: string,
    name: string,
    entryId: string,
    costs: {
      cost: Array<{}>
    },
    forces: {
      force: Array<{}>
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

export type Profile = {
  type: string,
  name: string,
  id: string,
  characteristics: Array<{
    name: string,
    value: string | number
  }>
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