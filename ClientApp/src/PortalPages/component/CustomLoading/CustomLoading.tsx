import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import React, { createContext, useContext, useState } from "react";
import style from "./Customloading.module.scss";

interface ICustomLoading {
  openLoading: () => void;
  closeLoading: () => void;
}

const defaultValue: ICustomLoading = {
  openLoading: () => console.log("spin"),
  closeLoading: () => console.log("spin"),
};

const LoadingContext = createContext<ICustomLoading>(defaultValue);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  const openLoading = () => {
    setLoading(true);
  };

  const closeLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ openLoading, closeLoading }}>
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
        spinning={loading}
        className={style.customLoading}
        rootClassName={style.customLoading}
      >
        {children}
      </Spin>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
