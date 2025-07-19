import { CloseOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import dayjs from "dayjs";
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Template } from "src/PortalPages/model/TemplateModel";
import style from "./TemplateDetail.module.scss";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";

export interface ITemplateDetailRef {
  openPanel: () => void;
}

interface ITemplateDetail {
  template?: Template.TemplateListModel;
}

const Component = (
  { template }: ITemplateDetail,
  ref: Ref<ITemplateDetailRef>
) => {
  const [open, setOpen] = useState(false);
  const uploadRef = useRef<FileUploadPropsRef>(null);

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  useEffect(() => {
    if (template?.templateId) {
      uploadRef?.current?.setServiceId(template?.templateId);
    }
  }, [open]);

  const openPanel = () => {
    setOpen(true);
  };

  const closePanel = () => {
    setOpen(false);
  };

  return (
    <Drawer
      title="Template detail"
      open={open}
      width={720}
      extra={
        <Button type="text" onClick={closePanel} icon={<CloseOutlined />} />
      }
      closable={false}
      className={style.customPanel}
      footer={
        <div className={style.bottomButton}>
          <Button onClick={closePanel}>Close</Button>
        </div>
      }
    >
      <CustomCard label="Template information">
        <CustomText label="Template name">{template?.templateName}</CustomText>
        <CustomText label="Description">{template?.description}</CustomText>
        <CustomText label="Created by">{template?.createdByName ?? 'Admin'}</CustomText>
        <CustomText label="Created at">
          {dayjs(template?.createdDate).format("DD/MMM/YYYY HH:mm")}
        </CustomText>
      </CustomCard>
      <CustomCard label="Template file">
        <FileUpload serviceType="templates" ref={uploadRef} viewOnly />
      </CustomCard>
    </Drawer>
  );
};

export const TemplateDetail = forwardRef(Component);
