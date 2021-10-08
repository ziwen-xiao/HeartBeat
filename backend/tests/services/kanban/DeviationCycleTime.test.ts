import "mocha";
import { Cards } from "../../../src/models/kanban/RequestKanbanResults";
import { JiraCard, JiraCardField } from "../../../src/models/kanban/JiraCard";
import { TargetField } from "../../../src/contract/kanban/KanbanTokenVerifyResponse";
import { ClassificationField, CycleTime } from "../../../src/contract/GenerateReporter/GenerateReporterResponse";
import { getClassificationOfSelectedFields } from "../../../src/services/kanban/Classification";
import { expect } from "chai";
import { CalculateByIterations, CalculateStdDeviationAndAvgCycleTime, GroupCardsByIteration } from "../../../src/services/kanban/CalculateCycleTime";
import { keys } from "lodash";
import { RequestKanbanColumnSetting } from "../../../src/contract/GenerateReporter/GenerateReporterRequestBody";
import { CycleTimeInfo, JiraCardResponse } from "../../../src/contract/kanban/KanbanStoryPointResponse";
import { Dictionary } from "lodash";
import { DeviationCycleTimePerIteration } from "../../../src/models/kanban/DeviationCycleTimePerIteration";

// "测试deviation以及cycletime计算准确性，测试分组正确，测试exportExcel"

describe("group cards by iteration & calculate by iteration & export excel", () => {
  const emptyJiraCardField: JiraCardField = {
    assignee: { accountId: "", displayName: "" },
    storyPoints: 0,
    fixVersions: [],
    issuetype: { name: "" },
    reporter: { displayName: "" },
    status: { name: "" },
    statuscategorychangedate: "",
    summary: "",
  };
  const cards: Cards = {
    cardsNumber: 3,
    matchedCards: [
      {
        baseInfo: {
          key: "",
          fields: ((): JiraCardField => {
            emptyJiraCardField.storyPoints = 1;
            emptyJiraCardField.fixVersions = [{ name: "Release 1" }];
            emptyJiraCardField.reporter = { displayName: "reporter one" };
            emptyJiraCardField.sprint = "iteration1";
            return { ...emptyJiraCardField };
          })(),
        },
        cycleTime: [
          { column: "DOING", day: 0.98 },
          { column: "DONE", day: 5.02 },
          { column: "TEST", day: 0 },
          { column: "DOING", day: 1 },
          { column: "BLOCKED", day: 2 },
        ],
        originCycleTime: [],
        cycleTimeFlat: undefined,
        buildCycleTimeFlatObject: () => void {},
        calculateTotalCycleTimeDivideStoryPoints: () => void {},
      },
      {
        baseInfo: {
          key: "",
          fields: ((): JiraCardField => {
            emptyJiraCardField.storyPoints = 2;
            emptyJiraCardField.fixVersions = [{ name: "Release 1" }];
            emptyJiraCardField.reporter = { displayName: "reporter one" };
            emptyJiraCardField.sprint = "iteration2";
            return { ...emptyJiraCardField };
          })(),
        },
        cycleTime: [
          { column: "DOING", day: 0.98 },
          { column: "DONE", day: 5.02 },
          { column: "TEST", day: 0 },
          { column: "DOING", day: 1 },
          { column: "BLOCKED", day: 2 },
        ],
        originCycleTime: [],
        cycleTimeFlat: undefined,
        buildCycleTimeFlatObject: () => void {},
        calculateTotalCycleTimeDivideStoryPoints: () => void {},
      },
      {
        baseInfo: {
          key: "",
          fields: ((): JiraCardField => {
            emptyJiraCardField.storyPoints = undefined;
            emptyJiraCardField.fixVersions = [{ name: "Release 2" }];
            emptyJiraCardField.reporter = { displayName: "reporter two" };
            emptyJiraCardField.sprint = "iteration1";
            return { ...emptyJiraCardField };
          })(),
        },
        cycleTime: [
          // { column: "DOING", day: 0.98 },
          // { column: "DONE", day: 5.02 },
          // { column: "TEST", day: 0 },
          // { column: "DOING", day: 1 },
          // { column: "BLOCKED", day: 2 },
        ],
        originCycleTime: [],
        cycleTimeFlat: undefined,
        buildCycleTimeFlatObject: () => void {},
        calculateTotalCycleTimeDivideStoryPoints: () => void {},
      },
    ],
    storyPointSum: 3,
  };
  const boardColumns: RequestKanbanColumnSetting[] = [
    { name: "DOING", value: "In Dev" },
    { name: "TEST", value: "Testing" },
    { name: "DONE", value: "Done" },
  ];
  const expectedCircleTime: CycleTime = {
    totalTimeForCards: 1.98,
    averageCircleTimePerCard: "1.98",
    averageCycleTimePerSP: "0.99",
    swimlaneList: [
      {
        optionalItemName: "In Dev",
        averageTimeForSP: "0.99",
        averageTimeForCards: "1.98",
        totalTime: "1.98",
      },
      {
        optionalItemName: "Done",
        averageTimeForSP: "2.51",
        averageTimeForCards: "5.02",
        totalTime: "5.02",
      },
      {
        optionalItemName: "Testing",
        averageTimeForSP: "0.00",
        averageTimeForCards: "0.00",
        totalTime: "0.00",
      },
    ],
  };
  describe("group cards by iteration", () => {
    it.only("should return cards grouped by iteration", () => {
      const cardsGroupByIteration = GroupCardsByIteration(cards);
      expect(cardsGroupByIteration["iteration1"].length).deep.equal(2);
      expect(cardsGroupByIteration["iteration2"].length).deep.equal(1);
      console.log(cardsGroupByIteration["iteration1"][0].baseInfo.fields.reporter);
    });
  });
  describe("calculate stdDeviation and avgCycleTime", () => {
    it.only("should return correct stdDeviation and avgCycleTime", () => {
      const iterationName = 'iteration for test';
      const cardsCycleTime = [1, 1, 2, 3, 5];
      const result = CalculateStdDeviationAndAvgCycleTime(iterationName, cardsCycleTime);
      expect(result.iterationName).deep.equal(iterationName);
      expect(result.standardDeviation).deep.equal(1.5);
      expect(result.averageCycleTime).deep.equal(2.4);
    });
  });
  describe("calculate stdDeviation and avgCycleTime by iteration", () => {
    it.only("should return correct stdDeviation and avgCycleTime by iteration", () => {
      const deviationAndCycleTime: DeviationCycleTimePerIteration[] = CalculateByIterations(cards, boardColumns);
      expect(deviationAndCycleTime.length).deep.equal(2);
      console.log(deviationAndCycleTime);
    });
  });
});