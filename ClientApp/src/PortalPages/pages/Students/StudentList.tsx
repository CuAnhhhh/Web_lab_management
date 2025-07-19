import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, notification, Select, Tabs, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentRoleIdList } from "src/PortalPages/api/ConfigurationApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import StudentTable from "./StudentTable/StudentTable";

const StudentList = () => {
  const navigate = useNavigate();
  const { openLoading, closeLoading } = useLoading();
  const [currentTab, setCurrentTab] = useState<string>("open");
  const [filter, setFilter] = useState<string>();
  const [option, setOption] = useState<{ value: string; label: string }[]>();

  const onChangeTab = (e: string) => {
    setCurrentTab(e);
  };

  useEffect(() => {
    getOption();
  }, []);

  const getOption = async () => {
    try {
      openLoading();
      const result = await getStudentRoleIdList();
      if (result?.isDone) {
        setOption(
          result?.studentRoleList?.map((item) => ({
            value: item?.studentRoleId ?? "",
            label: item?.studentRoleName ?? "",
          }))
        );
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "open",
      tabKey: "open",
      label: <div style={{ fontWeight: 600 }}>In Lab</div>,
      children: (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
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
            <Select
              style={{ width: 200, height: 40 }}
              showSearch
              allowClear
              placeholder="Select a student role"
              options={option}
              onChange={(e) => setFilter(e)}
            />
          </div>
          <StudentTable tab="open" currentTab={currentTab} filter={filter} />
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
