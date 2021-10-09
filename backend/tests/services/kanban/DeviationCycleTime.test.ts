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
    cardsNumber: 5,
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
            emptyJiraCardField.sprint = "iteration1";
            return { ...emptyJiraCardField };
          })(),
        },
        cycleTime: [
          { column: "DOING", day: 1.02 },
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
          fields: {
            assignee: { accountId: "", displayName: "" },
            storyPoints: 0,
            fixVersions: [],
            issuetype: { name: "" },
            reporter: { displayName: "" },
            status: { name: "" },
            statuscategorychangedate: "",
            summary: "",
          }
        },
        cycleTime: [],
        originCycleTime: [],
        cycleTimeFlat: undefined,
        buildCycleTimeFlatObject: () => void {},
        calculateTotalCycleTimeDivideStoryPoints: () => void {},
      },
      {
        baseInfo: {
          key: "",
          fields: {
            assignee: { accountId: "", displayName: "" },
            storyPoints: 0,
            fixVersions: [],
            issuetype: { name: "" },
            reporter: { displayName: "" },
            status: { name: "" },
            statuscategorychangedate: "",
            summary: "",
            sprint: "",
          }
        },
        cycleTime: [],
        originCycleTime: [],
        cycleTimeFlat: undefined,
        buildCycleTimeFlatObject: () => void {},
        calculateTotalCycleTimeDivideStoryPoints: () => void {},
      },
    ],
    storyPointSum: 5,
  };
  const cardsOfNoSprint: Cards = {
    cardsNumber: 2,
    matchedCards: [
      {
        baseInfo: {
          key: "",
          fields: {
            assignee: { accountId: "", displayName: "" },
            storyPoints: 0,
            fixVersions: [],
            issuetype: { name: "" },
            reporter: { displayName: "" },
            status: { name: "" },
            statuscategorychangedate: "",
            summary: "",
          }
        },
        cycleTime: [],
        originCycleTime: [],
        cycleTimeFlat: undefined,
        buildCycleTimeFlatObject: () => void {},
        calculateTotalCycleTimeDivideStoryPoints: () => void {},
      },
      {
        baseInfo: {
          key: "",
          fields: {
            assignee: { accountId: "", displayName: "" },
            storyPoints: 0,
            fixVersions: [],
            issuetype: { name: "" },
            reporter: { displayName: "" },
            status: { name: "" },
            statuscategorychangedate: "",
            summary: "",
            sprint: "",
          }
        },
        cycleTime: [],
        originCycleTime: [],
        cycleTimeFlat: undefined,
        buildCycleTimeFlatObject: () => void {},
        calculateTotalCycleTimeDivideStoryPoints: () => void {},
      },
    ],
    storyPointSum: 2
  };
  const boardColumns: RequestKanbanColumnSetting[] = [
    { name: "DOING", value: "In Dev" },
    { name: "TEST", value: "Testing" },
    { name: "DONE", value: "Done" },
  ];

  describe("group cards by iteration", () => {
    it.only("should return cards grouped by iteration", () => {
      const cardsGroupByIteration = GroupCardsByIteration(cards);
      const cardsOfIteration1 = cardsGroupByIteration["iteration1"];
      const cardsOfIteration2 = cardsGroupByIteration["iteration2"];
      expect(cardsOfIteration1.length).deep.equal(2);
      expect(cardsOfIteration2.length).deep.equal(1);
      expect(cardsOfIteration2[0].cycleTime).deep.equal(
        [
          { column: "DOING", day: 0.98 },
          { column: "DONE", day: 5.02 },
          { column: "TEST", day: 0 },
          { column: "DOING", day: 1 },
          { column: "BLOCKED", day: 2 },
        ]
      );
    });
    it.only("should return empty dictionary if no sprint marked", () => {
      const cardsOfNoSprintAfterGroup = GroupCardsByIteration(cardsOfNoSprint);
      expect(cardsOfNoSprintAfterGroup).deep.equal({});
    });
  });

  describe("calculate stdDeviation and avgCycleTime", () => {
    const iterationName = "iteration for test";
    it.only("should return correct stdDeviation and avgCycleTime", () => {
      const cardsCycleTime = [1, 1, 2, 3, 5];
      const result = CalculateStdDeviationAndAvgCycleTime(iterationName, cardsCycleTime);
      expect(result.iterationName).deep.equal(iterationName);
      expect(result.standardDeviation).deep.equal(1.5);
      expect(result.averageCycleTime).deep.equal(2.4);
    });
    it.only("should throw if input array is empty", () => {
      const emptyCardsCycleTime: number[] = [];
      expect(CalculateStdDeviationAndAvgCycleTime(iterationName, emptyCardsCycleTime)).to.Throw;
    });
  });

  describe("calculate stdDeviation and avgCycleTime by iteration", () => {
    it.only("should return correct stdDeviation and avgCycleTime by iteration", () => {
      const stdDeviationAndAvgCycleTime: DeviationCycleTimePerIteration[] = CalculateByIterations(cards, boardColumns);
      const calculatedDataOfIteration1 = stdDeviationAndAvgCycleTime[0];
      const calculatedDataOfIteration2 = stdDeviationAndAvgCycleTime[1];
      expect(stdDeviationAndAvgCycleTime.length).deep.equal(2);
      expect(calculatedDataOfIteration1.iterationName).deep.equal("iteration1");
      expect(calculatedDataOfIteration1.standardDeviation).deep.equal(0.02);
      expect(calculatedDataOfIteration1.averageCycleTime).deep.equal(2.00);
      expect(calculatedDataOfIteration2).deep.equal(
        {
          iterationName: "iteration2",
          standardDeviation: 0,
          averageCycleTime: 1.98,
        }
      );
    });
  });
});