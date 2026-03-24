export interface AlternatePassiveSkill {
  readonly Name: string;
  readonly _rid: number;
  readonly AlternateTreeVersionsKey: number;
  readonly StatsKeys: readonly number[];
  readonly Stat1Min: number;
  readonly Stat1Max: number;
  readonly Stat2Min: number;
  readonly Stat2Max: number;
  readonly Unknown10: number;
  readonly Unknown11: number;
  readonly Unknown12: number;
  readonly Unknown13: number;
  readonly PassiveType: readonly number[];
  readonly SpawnWeight: number;
  readonly RandomMin: number;
  readonly RandomMax: number;
}
