import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Tabs, TabsProps } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentTable from "./StudentTable/StudentTable";

const StudentList = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<string>("open");

  const onChangeTab = (e: string) => {
    setCurrentTab(e);
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "open",
      tabKey: "open",
      label: <div style={{ fontWeight: 600 }}>In Lab</div>,
      children: (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => navigate(`/student/create-student`)}
              className="commonButton"
              type="text"
            >
              Add a student
            </Button>
          </div>
          <StudentTable tab="open" currentTab={currentTab} />
        </>
      ),
    },
    {
      key: "close",
      tabKey: "close",
      label: <div style={{ fontWeight: 600 }}>Out Lab</div>,
      children: <StudentTable currentTab={currentTab} tab="close" />,
    },
  ];

  return (
    <div className="tablePadding">
      <Tabs onChange={onChangeTab} activeKey={currentTab} items={tabItems} />
    </div>
  );
};

export default StudentList;
