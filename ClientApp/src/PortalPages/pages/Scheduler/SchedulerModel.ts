export const monthsLabel = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

export enum IDateType {
  exam = 101,
  meeting = 102,
}

export const TypeTagsProps = {
  [IDateType.exam]: {
    color: "#FF9800",
    text: "Exam",
  },

  [IDateType.meeting]: {
    color: "#4CAF50",
    text: "Meeting",
  },
};
