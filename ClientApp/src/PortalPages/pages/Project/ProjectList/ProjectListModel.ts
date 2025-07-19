export enum EProjectType {
  da1 = 101,
  da2 = 102,
  da3 = 103,
  datn = 104,
}

export const TypeTagsProps = {
  [EProjectType.da1]: {
    color: "#2196F3",
    text: "Project 1",
  },

  [EProjectType.da2]: {
    color: "#FF9800",
    text: "Project 2",
  },

  [EProjectType.da3]: {
    color: "#673AB7",
    text: "Project 3",
  },

  [EProjectType.datn]: {
    color: "#4CAF50",
    text: "Project final",
  },
};

export interface IOptionType {
  label: string;
  value: number;
}

export interface IOption {
  label?: string;
  value: string;
  isAlert?: boolean;
}
