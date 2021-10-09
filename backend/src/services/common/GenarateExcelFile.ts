import ExcelJS, { Workbook } from "exceljs";
import path from "path";
import { RequestKanbanColumnSetting } from "../../contract/GenerateReporter/GenerateReporterRequestBody";
import { DeviationCycleTimePerIteration } from "../../models/kanban/DeviationCycleTimePerIteration";
import { Cards } from "../../models/kanban/RequestKanbanResults";
import { CalculateByIterations } from "../kanban/CalculateCycleTime";

// task4: 写入excel
export function writeToExcel(
  cards: Cards,
  boardColumns: RequestKanbanColumnSetting[]
): void {
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet("sheet1");
  const worksheet = workbook.getWorksheet("sheet1");
  worksheet.columns = [
    { header: "Iteration", key: "iterationName", width: 16 },
    { header: "StdDeviation", key: "standardDeviation", width: 16 },
    { header: "AvgCycleTime", key: "averageCycleTime", width: 16 },
  ];

  const dataForTest: DeviationCycleTimePerIteration[] = CalculateByIterations(cards, boardColumns);
  dataForTest.forEach((item) => worksheet.addRow(item));

  const excelTimeStamp = new Date().getTime();
  const filename = `DeviationCycleTime-${excelTimeStamp}.xlsx`;
  const filepath = path.join("/Users/ziwen.xiao/beach/HeartBeat/backend/excel", filename);
  workbook.xlsx.writeFile(filepath).then(() => console.log("Congratulations!!!!"));
}