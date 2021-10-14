export class CompletedCardsBySprint {
  iterationName: string;
  cardsNumber: number;

  constructor(iterationName: string, cardsNumber: number) {
    this.iterationName = iterationName;
    this.cardsNumber = cardsNumber;
  }
}