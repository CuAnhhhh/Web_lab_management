import { Button, Result } from "antd";
import { Route, Routes, useNavigate } from "react-router-dom";
import ProjectType from "./Configuration/ProjectType/ProjectType";
import StudentRole from "./Configuration/StudentRoleList/StudentRole";
import MemberList from "./MemberList/MemberList";
import ReportDetail from "./MemberList/ReportDetail/ReportDetail";
import CreateProject from "./Project/ProjectList/CreateProject/CreateProject";
import ProjectDetail from "./Project/ProjectList/ProjectDetail/ProjectDetail";
import ProjectList from "./Project/ProjectList/ProjectList";
import ProjectReportList from "./Project/ProjectReport/ProjectReportList";
import SchedulerPage from "./Scheduler/Scheduler";
import CreateStudent from "./Students/CreateStudent/CreateStudent";
import StudentDetail from "./Students/StudentDetail/StudentDetail";
import StudentList from "./Students/StudentList";
import TemplateList from "./Template/TemplateList";

const CustomRouter = () => {
  const navigate = useNavigate();
  const isAdmin =
    JSON.parse(localStorage.getItem("userData") ?? "")?.studentId === "0";

  const renderNoPermission = () => (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you dont have permission to access this page."
      extra={
        <Button
          className="commonButton"
          type="primary"
          onClick={() => navigate("/overview")}
        >
          Back Home
        </Button>
      }
    />
  );

  const studentRouter = () => (
    <>
      <Route
        path="/student/student-list"
        element={isAdmin ? <StudentList /> : renderNoPermission()}
      />
      <Route
        path="/student/create-student"
        element={isAdmin ? <CreateStudent /> : renderNoPermission()}
      />
      <Route
        path="/student/edit-student/"
        element={isAdmin ? <CreateStudent /> : renderNoPermission()}
      />
      <Route
        path="/student/student-detail/"
        element={isAdmin ? <StudentDetail /> : renderNoPermission()}
      />
    </>
  );

  const memberRouter = () => (
    <>
      <Route path="/member/member-list" element={<MemberList />} />
      <Route path="/member/report-detail/" element={<ReportDetail />} />
    </>
  );

  const projectRouter = () => (
    <>
      <Route
        path="/project/project-list"
        element={isAdmin ? <ProjectList /> : renderNoPermission()}
      />
      <Route
        path="/project/project-detail/"
        element={isAdmin ? <ProjectDetail /> : renderNoPermission()}
      />
      <Route
        path="/project/create-project"
        element={isAdmin ? <CreateProject /> : renderNoPermission()}
      />
      <Route
        path="/project/edit-project/"
        element={isAdmin ? <CreateProject /> : renderNoPermission()}
      />
      <Route
        path="/project/project-report"
        element={isAdmin ? <ProjectReportList /> : renderNoPermission()}
      />
    </>
  );

  const configuration = () => (
    <>
      <Route
        path="/cofiguration/project-type"
        element={isAdmin ? <ProjectType /> : renderNoPermission()}
      />
      <Route
        path="/cofiguration/student-role"
        element={isAdmin ? <StudentRole /> : renderNoPermission()}
      />
    </>
  );

  return (
    <Routes>
      {studentRouter()}
      {memberRouter()}
      {projectRouter()}
      {configuration()}
      <Route path="/overview" element={<></>} />
      <Route path="/template" element={<TemplateList />} />
      <Route path="/scheduler" element={<SchedulerPage />} />
    </Routes>
  );
};

export default CustomRouter;
