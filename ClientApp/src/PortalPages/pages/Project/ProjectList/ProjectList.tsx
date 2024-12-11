import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Select, Tabs, TabsProps } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectTable from "./ProjectTable/ProjectTable";

const ProjectList = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("open");

  const onChangeTab = (e: string) => {
    setCurrentTab(e);
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "open",
      tabKey: "open",
      label: <div style={{ fontWeight: 600 }}>Open Project</div>,
      children: (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => navigate("/project/create-project")}
              className="commonButton"
              type="text"
            >
              Add a project
            </Button>
            <Button
              icon={<MinusCircleOutlined />}
              onClick={() => setOpen(true)}
              className="commonButton"
              type="text"
            >
              Remove a project
            </Button>
            <Select
              style={{ width: 130, height: 40 }}
              showSearch
              placeholder="Select a week"
              options={[]}
            />
          </div>
          <ProjectTable
            open={open}
            closePanel={() => setOpen(false)}
            tab="open"
            currentTab={currentTab}
          />
        </>
      ),
    },
    {
      key: "close",
      tabKey: "close",
      label: <div style={{ fontWeight: 600 }}>Closed Lab</div>,
      children: <ProjectTable currentTab={currentTab} tab="close" />,
    },
  ];

  return (
    <div className="tablePadding">
      <Tabs onChange={onChangeTab} activeKey={currentTab} items={tabItems} />
    </div>
  );
};

export default ProjectList;
