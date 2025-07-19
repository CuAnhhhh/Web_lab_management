import { notification } from "antd";
import { useEffect, useState } from "react";
import { getStudentDetailEdit } from "src/PortalPages/api/StudentApi";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import { Student } from "src/PortalPages/model/StudentModel";
import style from "./Overview.module.scss";

const studentStatus: { label: string; value: number }[] = [
  { label: "First year", value: 101 },
  { label: "Second year", value: 102 },
  { label: "Third year", value: 103 },
  { label: "Fourth year", value: 104 },
  { label: "Fifth year", value: 105 },
  { label: "Sixth year", value: 106 },
  { label: "Master", value: 107 },
  { label: "Engineer", value: 108 },
  { label: "Ph.D.", value: 109 },
];

const nationality: { label: string; value: number }[] = [
  { label: "Vietnam", value: 101 },
  { label: "Laos", value: 102 },
  { label: "Cambodia", value: 103 },
];

const Overview = () => {
  const [studentDetail, setStudentDetail] =
    useState<Student.StudentDetailModel>();
  const { openLoading, closeLoading } = useLoading();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");

  useEffect(() => {
    if (userData?.studentId && userData?.studentId !== "0") {
      getStudentDetailFucntion();
    }
  }, [userData?.studentId]);

  const getStudentDetailFucntion = async () => {
    try {
      openLoading();
      const result = await getStudentDetailEdit(userData?.studentId ?? "");
      if (result?.isDone) {
        setStudentDetail(result?.studentDetail);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const onRenderInformation = () => (
    <>
      <div className={style.customText}>
        <CustomText label="Student Name">
          {studentDetail?.studentName}
        </CustomText>
        <CustomText label="Hust Id">{studentDetail?.hustId}</CustomText>
      </div>
      <div className={style.customText}>
        <CustomText label="Email">{studentDetail?.email}</CustomText>
        <CustomText label="Phone Number">
          {studentDetail?.phoneNumber}
        </CustomText>
      </div>
      <div className={style.customText}>
        <CustomText label="Nationality">
          {nationality.find((item) => item.value == studentDetail?.nationality)
            ?.label || "N/A"}
        </CustomText>
        <CustomText label="Address">
          {studentDetail?.address || "N/A"}
        </CustomText>
      </div>
      <div className={style.customText}>
        <CustomText label="Gender">
          {studentDetail?.gender ? "Female" : "Male"}
        </CustomText>
        <CustomText label="Student Status">
          {
            studentStatus.find((item) => item.value == studentDetail?.status)
              ?.label
          }
        </CustomText>
      </div>
    </>
  );

  const onRenderTeacherInformation = () => (
    <>
      <div className={style.customText}>
        <CustomText label="Teacher name">Nguyễn Thu Nga</CustomText>
        <CustomText label="Email">nga.nguyenthu1@hust.edu.vn</CustomText>
      </div>
      <div className={style.customText}>
        <CustomText label="University">
          Hanoi University of Science and Technology
        </CustomText>
        <CustomText label="Department">
          School of Electrical and Electronic Engineering
        </CustomText>
      </div>
      <div className={style.customText}>
        <CustomText label="Academic degree">Doctor of Philosophy</CustomText>
      </div>
      <div className={style.customText}>
        <CustomText label="Available days">Monday - Thursday</CustomText>
        <CustomText label="Available time">8:00 AM - 5:00 PM</CustomText>
      </div>
    </>
  );

  return (
    <div className={style.body}>
      <div className={style.content}>
        <CustomCard
          label={<div style={{ color: "#d9d9d9" }}>Teacher Information</div>}
        >
          {onRenderTeacherInformation()}
        </CustomCard>
        {userData?.studentId !== "0" && (
          <CustomCard
            label={<div style={{ color: "#d9d9d9" }}>Student Information</div>}
          >
            {onRenderInformation()}
          </CustomCard>
        )}
      </div>
      <div className={style.title}>
        <div>5G/6G Communications Research Lab</div>
        <div>Room 717, C-7, HUST</div>
      </div>
    </div>
  );
};

export default Overview;
