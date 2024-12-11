import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Input, Select, Table, TableProps } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { useNavigate } from "react-router-dom";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import style from "./ProjectReportList.module.scss";
import { IReportList } from "./ProjectReportListModel";

const ProjectReportList = () => {
  const currentWeek = [1, 2, 3, 4, 5, 6, 7];
  const navigate = useNavigate();
  const selectOption: DefaultOptionType[] = currentWeek.map((item) => ({
    label: item,
    value: item,
  }));

  const columns: TableProps<IReportList>["columns"] = [
    {
      title: "Project",
      key: "project",
      render: (_, record) => <Button type="text">{record?.project}</Button>,
    },
    {
      title: "Leader name",
      key: "name",
      render: (_, record) => <div>{record?.name}</div>,
    },
    {
      title: "Report week",
      key: "reportWeek",
      render: (_, record) => <div>{record?.reportWeek}</div>,
    },
    {
      title: "Report date",
      key: "reportDate",
      render: (_, record) => <div>{record?.createDate}</div>,
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <CustomTooltip content="Edit">
          <Button icon={<EditOutlined />} type="text" />
        </CustomTooltip>
      ),
    },
  ];

  return (
    <div className="tablePadding">
      <div className={style.header}>
        <Button
          icon={<PlusCircleOutlined />}
          className="commonButton"
          type="text"
        >
          Add a report
        </Button>
        <div className={style.filter}>
          <Select
            style={{ width: 130, height: 40 }}
            showSearch
            placeholder="Select a week"
            filterOption={(input, option) => {
              if (option?.label && typeof option?.label === "string") {
                return (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }
              return false;
            }}
            options={selectOption}
          />
          <Input.Search style={{ height: 40, width: 200 }} />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={[]}
        className="borderTable"
        rowKey={(record) => record.id ?? ""}
      />
    </div>
  );
};

export default ProjectReportList;
