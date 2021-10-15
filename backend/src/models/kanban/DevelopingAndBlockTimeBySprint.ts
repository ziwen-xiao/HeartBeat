export class DevelopingAndBlockTimeBySprint {
  iterationName: string;
  developingTime: number;
  blockedTime: number;

  constructor(iterationName: string, developingTime: number, blockedTime: number) {
    this.iterationName = iterationName;
    this.developingTime = developingTime;
    this.blockedTime = blockedTime;
  }
}