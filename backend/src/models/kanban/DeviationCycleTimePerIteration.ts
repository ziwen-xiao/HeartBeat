export class DeviationCycleTimePerIteration {
  iterationName: string;
  standardDeviation: number;
  averageCycleTime: number;

  constructor(iterationName: string, standardDeviation: number, averageCycleTime: number) {
    this.iterationName = iterationName;
    this.standardDeviation = standardDeviation;
    this.averageCycleTime = averageCycleTime;
  }
}