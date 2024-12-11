import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Button, notification, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
  deleteTemplate,
  getTemplateList,
} from "src/PortalPages/api/TemplateApi";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Template } from "src/PortalPages/model/TemplateModel";
import {
  ITemplateDetailRef,
  TemplateDetail,
} from "./TemplateDetail/TemplateDetail";
import { ITemplateFormRef, TemplateForm } from "./TemplateForm/TemplateForm";

const TemplateList = () => {
  const TemplateFormRef = useRef<ITemplateFormRef>(null);
  const TemplateDetailRef = useRef<ITemplateDetailRef>(null);
  const [templateList, setTemplateList] =
    useState<Template.TemplateListModel[]>();
  const [reload, setReload] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [templateSelect, setTemplateSelect] =
    useState<Template.TemplateListModel>();

  const trigger = () => setReload(!reload);

  useEffect(() => {
    getTemplateListFucntion();
  }, [reload]);

  const getTemplateListFucntion = async () => {
    try {
      const result = await getTemplateList();
      if (result?.isDone) {
        setTemplateList(result?.templateList);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const deleteTemplateFunction = async () => {
    try {
      const result = await deleteTemplate(templateSelect?.templateId ?? "");
      if (result?.isDone) {
        notification.open({
          message: "Delete template successed",
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

  const columns: TableProps<Template.TemplateListModel>["columns"] = [
    {
      title: "Template name",
      key: "name",
      render: (_, record) => (
        <Button
          type="text"
          onClick={() => {
            setTemplateSelect(record);
            TemplateDetailRef?.current?.openPanel();
          }}
        >
          {record?.templateName}
        </Button>
      ),
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
        <div style={{ display: "flex" }}>
          <CustomTooltip content="Edit">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => {
                setTemplateSelect(record);
                TemplateFormRef?.current?.openPanel(record?.templateId);
              }}
            />
          </CustomTooltip>
          <CustomTooltip content="Delete">
            <Button
              icon={<DeleteOutlined />}
              type="text"
              onClick={() => {
                setTemplateSelect(record);
                setOpenModal(true);
              }}
            />
          </CustomTooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="tablePadding">
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          icon={<PlusCircleOutlined />}
          onClick={() => TemplateFormRef?.current?.openPanel()}
          className="commonButton"
          type="text"
        >
          Add a template
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={templateList}
        className="borderTable"
        rowKey={(record) => record.templateId ?? ""}
      />
      <TemplateDetail ref={TemplateDetailRef} template={templateSelect} />
      <TemplateForm
        ref={TemplateFormRef}
        trigger={trigger}
        template={templateSelect}
      />
      <CustomModal
        title="Confirm delete template"
        open={openModal}
        onOk={() => deleteTemplateFunction()}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to delete the below template record, it will be
          permanently deleted
        </div>
        <CustomText label="Template name">
          {templateSelect?.templateName}
        </CustomText>
        <CustomText label="Description">
          {templateSelect?.description}
        </CustomText>
        <CustomText label="Created by">
          {templateSelect?.createdBy ?? "Admin"}
        </CustomText>
        <CustomText label="Created at">
          {dayjs(templateSelect?.createdDate).format("DD/MMM/YYYY")}
        </CustomText>
      </CustomModal>
    </div>
  );
};

export default TemplateList;
