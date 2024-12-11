import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, notification, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
  deleteStudentRole,
  getStudentRoleList,
} from "src/PortalPages/api/ConfigurationApi";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Configuration } from "src/PortalPages/model/ConfigurationModel";
import {
  CreateStudentRole,
  ICreateStudentRoleRef,
} from "./CreateStudentRole/CreateStudentRole";

const StudentRole = () => {
  const [roleList, setRoleList] =
    useState<Configuration.StudentRoleListModel[]>();
  const [reload, setReload] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [roleSelect, setRoleSelect] =
    useState<Configuration.StudentRoleListModel>();
  const CreateStudentRoleRef = useRef<ICreateStudentRoleRef>(null);

  const trigger = () => setReload(!reload);

  useEffect(() => {
    getRoleListFucntion();
  }, [reload]);

  const getRoleListFucntion = async () => {
    try {
      const result = await getStudentRoleList();
      if (result?.isDone) {
        setRoleList(result?.studentRoleList);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const deleteRoleFunction = async () => {
    try {
      const result = await deleteStudentRole(roleSelect?.studentRoleId ?? "");
      if (result?.isDone) {
        notification.open({
          message: "Delete role successed",
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

  const columns: TableProps<Configuration.StudentRoleListModel>["columns"] = [
    {
      title: "Student Role  name",
      key: "name",
      render: (_, record) => <div>{record?.studentRoleName}</div>,
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
              setRoleSelect(record);
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
          onClick={() => CreateStudentRoleRef.current?.openPanel()}
        >
          Add a student role
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={roleList}
        className="borderTable"
        rowKey={(record) => record?.studentRoleId ?? ""}
      />
      <CustomModal
        title="Confirm delete student role"
        open={openModal}
        onOk={() => deleteRoleFunction()}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to delete the below Student Role record, it will be
          permanently deleted
        </div>
        <CustomText label="Student role name">
          {roleSelect?.studentRoleName}
        </CustomText>
        <CustomText label="Description">
          {roleSelect?.studentRoleName}
        </CustomText>
        <CustomText label="Created by">{roleSelect?.createdBy}</CustomText>
        <CustomText label="Created at">
          {dayjs(roleSelect?.createdDate).format("DD/MMM/YYYY")}
        </CustomText>
      </CustomModal>
      <CreateStudentRole trigger={trigger} ref={CreateStudentRoleRef} />
    </div>
  );
};

export default StudentRole;
