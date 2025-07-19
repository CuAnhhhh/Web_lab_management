import { Tooltip } from "antd";
import React from "react";
import style from "./CustomTooltip.module.scss";

interface ICustomTooltip {
  content?: React.ReactNode;
  children?: React.ReactNode;
  row?: number;
  maxWidth?: number;
}

const CustomTooltip = (props: ICustomTooltip) => {
  const { content, children, row, maxWidth } = props;
  return (
    <Tooltip
      title={
        <div style={{ color: "#000", whiteSpace: "pre-wrap" }}>{content}</div>
      }
      color="#eaeff4"
      placement="top"
      trigger={"hover"}
    >
      <div
        className={style.children}
        style={{ WebkitLineClamp: row ?? 1, maxWidth: maxWidth }}
      >
        {children ?? content}
      </div>
    </Tooltip>
  );
};

export default CustomTooltip;
