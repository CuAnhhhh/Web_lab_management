import { Spin } from "antd";
import React from "react";

const LoadingComponent = () => {
  const [spinning, setSpinning] = React.useState(false);

  const openLoading = () => {
    setSpinning(true);
  };

  const closeLoading = () => {
    setSpinning(true);
  };

  return <Spin spinning={spinning} tip="Loading..." size="large" fullscreen />;
};

export default LoadingComponent;
