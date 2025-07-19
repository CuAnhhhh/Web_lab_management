import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import style from "./CustomCard.module.scss";

interface ICustomCard {
  label?: React.ReactNode;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  disable?: boolean;
  extra?: React.ReactNode;
}

const CustomCard = (props: ICustomCard) => {
  const { label, defaultOpen = true, children, disable = false, extra } = props;
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className={style.CustomCard}>
      <div
        className={style.CustomCardHeader}
        onClick={disable ? undefined : () => setOpen(!open)}
      >
        <div
          className={`${style.CustomCardTitle} ${
            disable ? style.grayBorder : style.cyanBorder
          }`}
        >
          {label}
        </div>
        <div className={style.CustomCardButton}>
          {extra}
          {open ? (
            <Button
              icon={<UpOutlined />}
              type="text"
            />
          ) : (
            <Button
              icon={<DownOutlined />}
              type="text"
            />
          )}
        </div>
      </div>
      <div style={{ display: open ? undefined : "none", paddingTop: 16 }}>
        {children}
      </div>
    </div>
  );
};

export default CustomCard;
