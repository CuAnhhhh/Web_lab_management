import { CloseOutlined } from "@ant-design/icons";
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
import { forwardRef, Ref, useImperativeHandle, useState } from "react";
import { createScheduler } from "src/PortalPages/api/SchedulerApi";
import { Scheduler } from "src/PortalPages/model/SchedulerModel";
import style from "./CreatePanel.module.scss";

export interface ICreatePanelRef {
  openPanel: () => void;
}

interface ICreatePanel {
  trigger?: () => void;
  studentId?: string;
  projectId?: string;
}

const Component = (
  { trigger, studentId, projectId }: ICreatePanel,
  ref: Ref<ICreatePanelRef>
) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [sameTime, setSameTime] = useState(false);

  const dateType = [
    { label: "Exam", value: 101 },
    { label: "Meeting", value: 102 },
  ];

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  const openPanel = () => {
    setOpen(true);
  };

  const closePanel = () => {
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
      createdBy: studentId,
      projectId: projectId,
      startDate: `${formatDate(
        form.getFieldValue("dateOccurred")
      )}T${formatTime(form.getFieldValue("startTime"))}+07:00`,
      endDate: `${formatDate(form.getFieldValue("dateOccurred"))}T${formatTime(
        form.getFieldValue("endTime")
      )}+07:00`,
    };

    try {
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
          style={{ height: 40 }}
          onChange={() => sameTime && setSameTime(false)}
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
          style={{ height: 40 }}
          onChange={() => sameTime && setSameTime(false)}
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
          style={{ height: 40 }}
          onChange={() => sameTime && setSameTime(false)}
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
        <Button type="text" onClick={closePanel} icon={<CloseOutlined />} />
      }
      closable={false}
      className={style.customPanel}
      footer={
        <div className={style.bottomButton}>
          <Button onClick={closePanel}>Close</Button>
          <Button onClick={form.submit} type="primary">
            Submit
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={submitForm}>
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
          <Select options={dateType} style={{ height: 40 }} />
        </Form.Item>
        {onRenderExamDuration()}
        {sameTime && (
          <div style={{ color: "#ff4d4f", marginTop: -24 }}>
            There is a schedule in this time!
          </div>
        )}
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={5} style={{ resize: "none" }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export const CreatePanel = forwardRef(Component);
