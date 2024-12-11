import {
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { Button, Empty, notification, Upload } from "antd";
import axios from "axios";
import {
  Dispatch,
  forwardRef,
  Ref,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import style from "./FileUpload.module.scss";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export interface FileUploadPropsRef {
  setServiceId: Dispatch<SetStateAction<string>>;
  uploadFuntion: (id: string) => Promise<void>;
  resetUpload: () => void;
}

interface IFileUploadProps {
  serviceType: "projects" | "templates" | "reports";
  viewOnly?: boolean;
}

interface IFileList {
  fileId?: string;
  fileName?: string;
  fileUrl?: string;
  serviceType?: string;
  serviceId?: string;
}

const Component = (
  { serviceType, viewOnly }: IFileUploadProps,
  ref: Ref<FileUploadPropsRef>
) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const listName = fileList.map((f) => f.name);
  const [serviceId, setServiceId] = useState<string>("");
  const [exsistCount, setExsistCount] = useState<number>(0);

  useEffect(() => {
    if (serviceId) {
      getFile();
    }
  }, [serviceId]);

  useImperativeHandle(ref, () => ({
    setServiceId,
    uploadFuntion,
    resetUpload,
  }));

  const resetUpload = () => {
    setFileList([]);
    setServiceId("");
  };

  const uploadFuntion = async (id: string) => {
    if (fileList.length === 0) return;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("file", file as FileType);
    });
    formData.append("serviceId", id);
    formData.append("serviceType", serviceType);
    formData.append("exsistCount", exsistCount.toString());
    try {
      await axios.post("https://localhost:7051/upload/uploadfile", formData);
      setFileList([]);
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const deleteFile = async (id?: string) => {
    try {
      await axios.get(`https://localhost:7051/upload/deletefile/${id}`);
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const downloadFile = async (file: UploadFile) => {
    try {
      const split = file.url?.split(serviceType + "/");
      const filename = split?.[1];
      const response = await axios.post(
        "https://localhost:7051/upload/downloadfile",
        { serviceType: serviceType, serviceId: filename },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/octet-stream",
        })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const getFile = async () => {
    try {
      const { data } = await axios.post(
        `https://localhost:7051/upload/getfilelist`,
        {
          serviceType: serviceType,
          serviceId: serviceId,
        }
      );

      const newFileList = (data as IFileList[])?.map((item) => ({
        uid: item?.fileId,
        name: item?.fileName,
        url: "https://localhost:7051/" + item?.fileUrl,
        status: "done",
      })) as UploadFile[];
      setFileList(newFileList);
      setExsistCount(newFileList.length);
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const onRemove = (file: UploadFile) => {
    if (serviceId) {
      deleteFile(file.uid);
    }
    const index = listName.indexOf(file.name);
    const newFileList = fileList.filter((_, i) => i !== index);
    setFileList(newFileList);
  };

  const autoUpload = async (files: UploadFile[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file as FileType);
    });
    formData.append("serviceId", serviceId);
    formData.append("serviceType", serviceType);
    formData.append("exsistCount", exsistCount.toString());
    try {
      await axios.post("https://localhost:7051/upload/uploadfile", formData);
      await getFile();
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const beforeUpload = (file: UploadFile, files: UploadFile[]) => {
    const tempNameList = files.map((item) => item.name);
    const index = tempNameList.indexOf(file.name);

    if (index + 1 == tempNameList.length) {
      const addList = files.filter((item) => !listName.includes(item.name));
      if (serviceId) {
        autoUpload(files);
      } else {
        setFileList([...fileList, ...addList]);
      }
    }
    return false;
  };

  return (
    <>
      <Upload
        multiple
        listType="picture"
        onRemove={onRemove}
        onDownload={downloadFile}
        beforeUpload={beforeUpload}
        fileList={fileList}
        showUploadList={{
          showDownloadIcon: viewOnly,
          downloadIcon: <DownloadOutlined style={{ fontSize: 20 }} />,
          showRemoveIcon: !viewOnly,
          removeIcon: <DeleteOutlined style={{ fontSize: 20 }} />,
        }}
        className={style.fileUpload}
      >
        {!viewOnly && (
          <Button
            type="primary"
            icon={<UploadOutlined />}
            className="commonButton"
            style={{ margin: "8px 0" }}
          >
            Upload
          </Button>
        )}
      </Upload>
      {!fileList?.length && viewOnly && (
        <div style={{ fontWeight: 700, textAlign: "center" }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
          Don&apos;t have any document!
        </div>
      )}
    </>
  );
};

export const FileUpload = forwardRef(Component);
