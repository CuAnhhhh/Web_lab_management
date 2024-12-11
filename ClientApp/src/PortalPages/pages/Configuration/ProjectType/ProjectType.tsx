import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, notification, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
  deleteProjectType,
  getProjectTypeList,
} from "src/PortalPages/api/ConfigurationApi";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Configuration } from "src/PortalPages/model/ConfigurationModel";
import {
  CreateProjectType,
  ICreateProjectTypeRef,
} from "./CreateProjectType/CreateProjectType";

const ProjectType = () => {
  const [typeList, setTypeList] =
    useState<Configuration.ProjectTypeListModel[]>();
  const [reload, setReload] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [typeSelect, setTypeSelect] =
    useState<Configuration.ProjectTypeListModel>();
  const CreateProjectTypeRef = useRef<ICreateProjectTypeRef>(null);

  const trigger = () => setReload(!reload);

  useEffect(() => {
    getListProjectRole();
  }, [reload]);

  const getListProjectRole = async () => {
    try {
      const result = await getProjectTypeList();
      if (result?.isDone) {
        setTypeList(result?.projectTypeList);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const deleteTypeFunction = async () => {
    try {
      const result = await deleteProjectType(typeSelect?.projectTypeId ?? "");
      if (result?.isDone) {
        notification.open({
          message: "Delete type successed",
          type: "success",
        });
        setOpenModal(false);
        trigger();
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const columns: TableProps<Configuration.ProjectTypeListModel>["columns"] = [
    {
      title: "Project Type name",
      key: "name",
      render: (_, record) => <div>{record?.projectTypeName}</div>,
    },
    {
      title: "Description",
      key: "description",
      render: (_, record) => <div>{record?.description}</div>,
    },
    {
      title: "Created by",
      key: "createdby",
      render: (_, record) => <div>{record?.createdBy ?? "Admin"}</div>,
    },
    {
      title: "Created date",
      key: "createddate",
      render: (_, record) => (
        <div>{dayjs(record?.createdDate).format("DD/MMM/YYYY")}</div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <CustomTooltip content="Delete">
          <Button
            icon={<DeleteOutlined />}
            type="text"
            onClick={() => {
              setTypeSelect(record);
              setOpenModal(true);
            }}
          />
        </CustomTooltip>
      ),
    },
  ];

  return (
    <div className="tablePadding">
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          icon={<PlusCircleOutlined />}
          className="commonButton"
          type="text"
          onClick={() => CreateProjectTypeRef.current?.openPanel()}
        >
          Add a Project Type
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={typeList}
        className="borderTable"
        rowKey={(record) => record?.projectTypeId ?? ""}
      />
      <CustomModal
        title="Confirm delete Project Type"
        open={openModal}
        onOk={() => deleteTypeFunction()}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to delete the below Project Type record, it will be
          permanently deleted
        </div>
        <CustomText label="Project Type name">
          {typeSelect?.projectTypeName}
        </CustomText>
        <CustomText label="Description">{typeSelect?.description}</CustomText>
        <CustomText label="Created by">{typeSelect?.createdBy}</CustomText>
        <CustomText label="Created at">
          {dayjs(typeSelect?.createdDate).format("DD/MMM/YYYY")}
        </CustomText>
      </CustomModal>
      <CreateProjectType ref={CreateProjectTypeRef} trigger={trigger} />
    </div>
  );
};

export default ProjectType;
