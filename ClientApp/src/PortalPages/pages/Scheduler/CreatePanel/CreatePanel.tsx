import { CloseOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  notification,
  TimePicker,
} from "antd";
import Select from "antd/es/select";
import dayjs, { Dayjs } from "dayjs";
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { getProjectListName } from "src/PortalPages/api/ProjectApi";
import { createScheduler } from "src/PortalPages/api/SchedulerApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import { Scheduler } from "src/PortalPages/model/SchedulerModel";
import style from "./CreatePanel.module.scss";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";

export interface ICreatePanelRef {
  openPanel: () => void;
}

interface IOptionType {
  label?: string;
  value?: string | number;
}

interface ICreatePanel {
  trigger?: () => void;
}

const Component = ({ trigger }: ICreatePanel, ref: Ref<ICreatePanelRef>) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [sameTime, setSameTime] = useState(false);
  const [listProjects, setListProjects] = useState<IOptionType[]>();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const { openLoading, closeLoading } = useLoading();
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const dateType: IOptionType[] = [
    { label: "Exam", value: 101 },
    { label: "Meeting", value: 102 },
  ];

  useEffect(() => {
    if (userData?.studentId == "0" && open) {
      getProjectList();
    }
  }, [open]);

  const getProjectList = async () => {
    try {
      openLoading();
      const result = await getProjectListName(0);
      if (result?.isDone) {
        setListProjects(
          result?.projectList?.map((item) => ({
            label: item?.projectName,
            value: item?.projectId,
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

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  const openPanel = () => {
    setOpen(true);
  };

  const closePanel = () => {
    setOnChangeForm(false);
    setOpenModal(false);
    form.resetFields();
    setOpen(false);
  };

  const formatDate = (date?: Dayjs) => {
    return dayjs(date).format("YYYY-MM-DD");
  };

  const formatTime = (time?: Dayjs) => {
    return dayjs(time).format("HH:mm:ss");
  };

  const submitForm = async () => {
    if (sameTime) return;
    const model: Scheduler.SchedulerModel = {
      eventType: form.getFieldValue("event"),
      description: form.getFieldValue("description"),
      createdBy: userData?.studentId,
      projectId: form.getFieldValue("project") ?? userData?.projectId,
      startDate: `${formatDate(
        form.getFieldValue("dateOccurred")
      )}T${formatTime(form.getFieldValue("startTime"))}+07:00`,
      endDate: `${formatDate(form.getFieldValue("dateOccurred"))}T${formatTime(
        form.getFieldValue("endTime")
      )}+07:00`,
    };

    try {
      openLoading();
      const result = await createScheduler(model);
      if (result?.isDone) {
        notification.open({
          message: "Create schedule successed",
          type: "success",
        });
        trigger?.();
        closePanel();
      }
      if (result?.errorCode === 101) {
        setSameTime(true);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const onRenderExamDuration = () => (
    <div className={style.dateSelector}>
      <Form.Item
        label="Date occurred"
        name="dateOccurred"
        rules={[
          {
            required: true,
            message: "Pick a day!",
          },
        ]}
      >
        <DatePicker
          placeholder="Date occurred"
          size="large"
          onChange={() => {
            sameTime && setSameTime(false);
            setOnChangeForm(true);
          }}
        />
      </Form.Item>
      <div style={{ alignContent: "center", fontWeight: 600 }}>At</div>
      <Form.Item
        label="Start time"
        name="startTime"
        rules={[
          {
            required: true,
            message: "Choose a start time!",
          },
        ]}
      >
        <TimePicker
          format={"HH:mm"}
          needConfirm={false}
          placeholder="Start time"
          size="large"
          onChange={() => {
            sameTime && setSameTime(false);
            setOnChangeForm(true);
          }}
        />
      </Form.Item>
      <div style={{ alignContent: "center", fontWeight: 600 }}>To</div>
      <Form.Item
        label="End time"
        name="endTime"
        rules={[
          {
            required: true,
            message: "Choose a end time!",
          },
        ]}
      >
        <TimePicker
          format={"HH:mm"}
          needConfirm={false}
          placeholder="End time"
          size="large"
          onChange={() => {
            sameTime && setSameTime(false);
            setOnChangeForm(true);
          }}
        />
      </Form.Item>
    </div>
  );

  return (
    <Drawer
      title="Create an event"
      open={open}
      width={720}
      extra={
        <Button
          type="text"
          onClick={onChangeForm ? () => setOpenModal(true) : closePanel}
          icon={<CloseOutlined />}
        />
      }
      closable={false}
      className={style.customPanel}
      footer={
        <div className={style.bottomButton}>
          <Button
            onClick={onChangeForm ? () => setOpenModal(true) : closePanel}
          >
            Close
          </Button>
          <Button onClick={form.submit} type="primary">
            Submit
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={submitForm}
        onChange={() => setOnChangeForm(true)}
      >
        {userData?.studentId == "0" && (
          <Form.Item
            label="Project"
            name="project"
            rules={[
              {
                required: true,
                message: "Choose a project!",
              },
            ]}
          >
            <Select
              options={listProjects}
              size="large"
              onChange={() => setOnChangeForm(true)}
            />
          </Form.Item>
        )}
        <Form.Item
          label="Event"
          name="event"
          rules={[
            {
              required: true,
              message: "Choose an event type!",
            },
          ]}
        >
          <Select
            options={dateType}
            size="large"
            onChange={() => setOnChangeForm(true)}
          />
        </Form.Item>
        {onRenderExamDuration()}
        {sameTime && (
          <div style={{ color: "#ff4d4f", marginTop: -24 }}>
            There is a schedule in this time!
          </div>
        )}
        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={5}
            style={{ resize: "none" }}
            onBlur={(e) =>
              form.setFieldValue("description", e.target.value.trim())
            }
          />
        </Form.Item>
      </Form>
      <CustomModal
        title={
          <div>
            <ExclamationCircleFilled style={{ color: "#08c" }} /> Discard change
          </div>
        }
        open={openModal}
        onOk={closePanel}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to cancel create schedule. All infomation will be removed!
        </div>
      </CustomModal>
    </Drawer>
  );
};

export const CreatePanel = forwardRef(Component);
