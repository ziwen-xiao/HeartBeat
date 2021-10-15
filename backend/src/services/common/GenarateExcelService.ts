import ExcelJS from "exceljs";
import path from "path";
import { GenerateReportRequest, RequestKanbanColumnSetting, RequestKanbanSetting } from "../../contract/GenerateReporter/GenerateReporterRequestBody";
import { StoryPointsAndCycleTimeRequest } from "../../contract/kanban/KanbanStoryPointParameterVerify";
import { CompletedCardsBySprint } from "../../models/kanban/CompletedCardsBySprint";
import { DevelopingAndBlockTimeBySprint } from "../../models/kanban/DevelopingAndBlockTimeBySprint";
import { DeviationCycleTimePerIteration } from "../../models/kanban/DeviationCycleTimePerIteration";
import { Cards } from "../../models/kanban/RequestKanbanResults";
import { CalculateCompletedCardsBySprint, CalculateDevelopingAndBlockedTimeBySprint, CalculateDeviationAndCycleTimeBySprint } from "../kanban/CalculateCycleTime";
import { Kanban, KanbanFactory } from "../kanban/Kanban";

export class GenerateExcelService {
  private allDonecards?: Cards;
  private nonDonecards?: Cards;
  private workbook = new ExcelJS.Workbook();

  async generateExcel(
    request: GenerateReportRequest
  ): Promise<void> {
    const kanbanSetting: RequestKanbanSetting = request.kanbanSetting;
    const kanban: Kanban = KanbanFactory.getKanbanInstantiateObject(
      kanbanSetting.type,
      kanbanSetting.token,
      kanbanSetting.site
    );
    const storyPointsAndCycleTimeRequest = new StoryPointsAndCycleTimeRequest(
      kanbanSetting.token,
      kanbanSetting.type,
      kanbanSetting.site,
      kanbanSetting.projectKey,
      kanbanSetting.boardId,
      kanbanSetting.doneColumn,
      request.startTime,
      request.endTime,
      kanbanSetting.targetFields,
      kanbanSetting.treatFlagCardAsBlock
    );
    this.allDonecards = await kanban.getStoryPointsAndCycleTime(
      storyPointsAndCycleTimeRequest,
      kanbanSetting.boardColumns,
      kanbanSetting.users
    );
    this.nonDonecards = await kanban.getStoryPointsAndCycleTimeForNonDoneCards(
      storyPointsAndCycleTimeRequest,
      kanbanSetting.boardColumns,
      kanbanSetting.users
    );
    const totalCards: Cards = {
      storyPointSum: this.allDonecards.storyPointSum + this.nonDonecards.storyPointSum,
      cardsNumber: this.allDonecards.cardsNumber + this.nonDonecards.cardsNumber,
      matchedCards: this.allDonecards.matchedCards.concat(this.nonDonecards.matchedCards),
    };

    await this.writeAllDataToExcel(this.allDonecards,this.nonDonecards, kanbanSetting.boardColumns);
  }

  // deviation & cycletime写入sheet
  async writeStdDeviationAndAvgCycleTimeBySprintToSheet(
    cards: Cards,
    boardColumns: RequestKanbanColumnSetting[]
  ): Promise<void> {
    this.workbook.addWorksheet("sheet1");
    const worksheet1 = this.workbook.getWorksheet("sheet1");
    worksheet1.columns = [
      { header: "Iteration", key: "iterationName", width: 16 },
      { header: "StdDeviation", key: "standardDeviation", width: 16 },
      { header: "AvgCycleTime", key: "averageCycleTime", width: 16 },
    ];

    const dataOfDeviationCycleTime: DeviationCycleTimePerIteration[] = CalculateDeviationAndCycleTimeBySprint(cards, boardColumns);
    dataOfDeviationCycleTime.forEach((item) => worksheet1.addRow(item));
  }

  // completedcards写进sheet
  async writeCompletedCardsBySprintToSheet(
    cards: Cards
  ): Promise<void> {
    this.workbook.addWorksheet("sheet2");
    const worksheet2 = this.workbook.getWorksheet("sheet2");
    worksheet2.columns = [
      { header: "Iteration", key: "iterationName", width: 16 },
      { header: "Completed Cards Number", key: "cardsNumber", width: 16 },
    ];

    const dataOfCompletedCards: CompletedCardsBySprint[] = CalculateCompletedCardsBySprint(cards);
    dataOfCompletedCards.forEach((item) => worksheet2.addRow(item));
  }

  // developing和blocked时间写进sheet
  async writeDevelopingAndBlockedTimeBySprintToSheet(
    cards: Cards,
    boardColumns: RequestKanbanColumnSetting[]
  ): Promise<void> {
    this.workbook.addWorksheet("sheet3");
    const worksheet3 = this.workbook.getWorksheet("sheet3");
    worksheet3.columns = [
      { header: "Iteration", key: "iterationName", width: 16 },
      { header: "Developing Time", key: "developingTime", width: 16 },
      { header: "Blocked Time", key: "blockedTime", width: 16 },
    ];

    const dataOfDevelopingAndBlockedTime: DevelopingAndBlockTimeBySprint[] = CalculateDevelopingAndBlockedTimeBySprint(cards, boardColumns);
    dataOfDevelopingAndBlockedTime.forEach((item) => worksheet3.addRow(item));
  }

  async writeAllDataToExcel(
    allDonecards: Cards,
    nonDonecards: Cards,
    boardColumns: RequestKanbanColumnSetting[]
  ): Promise<void> {
    const excelTimeStamp = new Date().getTime();
    const fileName = `Data-${excelTimeStamp}.xlsx`;
    const filePath = path.resolve("excel", fileName);
    const totalCards: Cards = {
      storyPointSum: allDonecards.storyPointSum + nonDonecards.storyPointSum,
      cardsNumber: allDonecards.cardsNumber + nonDonecards.cardsNumber,
      matchedCards: allDonecards.matchedCards.concat(nonDonecards.matchedCards),
    };

    this.writeStdDeviationAndAvgCycleTimeBySprintToSheet(totalCards, boardColumns)
      .then(() => this.writeCompletedCardsBySprintToSheet(allDonecards))
      .then(() => this.writeDevelopingAndBlockedTimeBySprintToSheet(totalCards, boardColumns))
      .then(() => this.workbook.xlsx.writeFile(filePath))
      .then(() => console.log("congratulations!!!"));
  }
}