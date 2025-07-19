import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, notification, Select, Tabs, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectTable from "./ProjectTable/ProjectTable";
import { getProjectTypeIdList } from "src/PortalPages/api/ConfigurationApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";

const ProjectList = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { openLoading, closeLoading } = useLoading();
  const [currentTab, setCurrentTab] = useState<string>("open");
  const [filter, setFilter] = useState<string>();
  const [option, setOption] = useState<{ value: string; label: string }[]>();
  const isAdmin =
    JSON.parse(localStorage.getItem("userData") ?? "null")?.studentId == "0";

  const onChangeTab = (e: string) => {
    setCurrentTab(e);
  };

  useEffect(() => {
    getOption();
  }, []);

  const getOption = async () => {
    try {
      openLoading();
      const result = await getProjectTypeIdList();
      if (result?.isDone) {
        setOption(
          result?.projectTypeList?.map((item) => ({
            value: item?.projectTypeId ?? "",
            label: item?.projectTypeName ?? "",
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
      label: <div style={{ fontWeight: 600 }}>Open Projects</div>,
      children: (
        <>
          <div
            style={{
              display: isAdmin ? "flex" : "none",
              justifyContent: "space-between",
            }}
          >
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
            </div>
            <Select
              style={{ width: 200, height: 40 }}
              showSearch
              allowClear
              placeholder="Select a project type"
              options={option}
              onChange={(e) => setFilter(e)}
            />
          </div>
          <ProjectTable
            open={open}
            closePanel={() => setOpen(false)}
            tab="open"
            currentTab={currentTab}
            filter={filter}
          />
        </>
      ),
    },
    {
      key: "close",
      tabKey: "close",
      label: <div style={{ fontWeight: 600 }}>Closed Projects</div>,
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
