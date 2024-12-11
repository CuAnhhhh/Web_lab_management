import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Calendar, Empty, notification, Select } from "antd";
import { HeaderRender } from "antd/es/calendar/generateCalendar";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import { getSchedulers } from "src/PortalPages/api/SchedulerApi";
import { Scheduler } from "src/PortalPages/model/SchedulerModel";
import { CreatePanel, ICreatePanelRef } from "./CreatePanel/CreatePanel";
import style from "./Scheduler.module.scss";
import SchedulerCard from "./SchedulerCard/SchedulerCard";
import { IDateType, monthsLabel } from "./SchedulerModel";

const SchedulerPage = () => {
  const CreatePanelRef = useRef<ICreatePanelRef>(null);
  const [reload, setReload] = useState<boolean>(false);
  const [schedulerList, setSchedulerList] =
    useState<Scheduler.SchedulerModel[]>();
  const [currentSchedules, setCurrentSchedules] =
    useState<Scheduler.SchedulerModel[]>();
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month());
  const [projectId, setProjectId] = useState<string>();
  const [isLeader, setIsLeader] = useState<boolean>();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");

  const trigger = () => setReload(!reload);

  const getSchedulerListFuntion = async () => {
    try {
      const result = await getSchedulers(userData?.studentId);
      if (result?.isDone) {
        setSchedulerList(result?.schedulerList);
        setProjectId(result?.projectId);
        setIsLeader(result?.isLeader);
        setCurrentSchedules(
          schedulerList?.filter((s) => dayjs().isSame(s?.startDate, "D"))
        );
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  useEffect(() => {
    getSchedulerListFuntion();
  }, [reload]);

  const getTime = (value?: string) => dayjs(value).format("HH:mm");

  const getListData = (value: Dayjs) => {
    const listData = [
      {
        content: "Exam",
        count: 0,
      },
      {
        content: "Meeting",
        count: 0,
      },
    ];
    schedulerList?.forEach((item) => {
      if (dayjs(value).isSame(item?.startDate, "D")) {
        if (item?.eventType === IDateType.exam) {
          listData[0].count += 1;
        } else listData[1].count += 1;
      }
    });
    return listData;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    const sameMonth = value.month() === selectedMonth;

    return (
      <ul style={{ listStyle: "none", margin: 0, padding: "0 4px" }}>
        {listData.map((item) =>
          item?.count === 0 ? (
            <></>
          ) : (
            <li key={item.content}>
              <div
                style={{ fontWeight: 600, opacity: sameMonth ? 0.88 : 0.25 }}
              >
                - {item?.content}: {item?.count}
              </div>
            </li>
          )
        )}
      </ul>
    );
  };

  const onRenderHeader: HeaderRender<dayjs.Dayjs> = ({ value, onChange }) => {
    const months: { value: number; label: string }[] = Object.entries(
      monthsLabel
    ).map(([key, keyvalue]) => ({ value: Number(key), label: keyvalue }));

    if (value.month() !== selectedMonth) {
      setSelectedMonth(value.month());
    }

    return (
      <div className={style.dateSelector}>
        <div className={style.yearHeader}>{value.year()}</div>
        <Select
          size="middle"
          style={{ width: 125 }}
          popupMatchSelectWidth
          value={value.month()}
          onChange={(newMonth) => {
            const newSelected = value.clone().month(newMonth);
            onChange(newSelected);
          }}
        >
          {months.map((month) => (
            <Select.Option key={month.value} value={month.value}>
              {month.label}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  };

  return (
    <div className="tablePadding">
      <div
        style={{
          display: isLeader && projectId ? "flex" : "none",
          paddingBottom: 16,
        }}
      >
        <Button
          icon={<PlusCircleOutlined />}
          className="commonButton"
          onClick={() => {
            CreatePanelRef?.current?.openPanel();
          }}
          type="text"
        >
          Add a event
        </Button>
      </div>
      <CreatePanel
        ref={CreatePanelRef}
        trigger={trigger}
        studentId={userData?.studentId}
        projectId={projectId}
      />
      <div style={{ display: "flex" }}>
        <Calendar
          headerRender={onRenderHeader}
          cellRender={(date: Dayjs) => dateCellRender(date)}
          className={style.customCalendar}
          onSelect={(date: Dayjs) => {
            setCurrentSchedules(
              schedulerList?.filter((s) =>
                dayjs(date).isSame(s?.startDate, "D")
              )
            );
          }}
        />
        <div className={style.schedulerDetail}>
          {currentSchedules?.map((item) => (
            <SchedulerCard schedulerItem={item} key={item?.schedulerId} />
          ))}
          {!currentSchedules?.length && (
            <div style={{ fontWeight: 600, textAlign: "center" }}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
              Dont have any schedule!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;
