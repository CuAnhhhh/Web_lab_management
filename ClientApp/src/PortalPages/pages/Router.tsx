import { Button, Result } from "antd";
import { Route, Routes, useNavigate } from "react-router-dom";
import ChatBox from "./Chatbox/Chatbox";
import ProjectType from "./Configuration/ProjectType/ProjectType";
import StudentRole from "./Configuration/StudentRoleList/StudentRole";
import MemberList from "./MemberList/MemberList";
import ReportDetail from "./MemberList/ReportDetail/ReportDetail";
import Overview from "./Overview/Overview";
import CreateProject from "./Project/ProjectList/CreateProject/CreateProject";
import ProjectDetail from "./Project/ProjectList/ProjectDetail/ProjectDetail";
import ProjectList from "./Project/ProjectList/ProjectList";
import ProjectReportList from "./Project/ProjectReport/ProjectReportList";
import ProjectReportDetail from "./Project/ProjectReport/ReportDetail/ProjectReportDetail";
import SchedulerPage from "./Scheduler/Scheduler";
import CreateStudent from "./Students/CreateStudent/CreateStudent";
import StudentDetail from "./Students/StudentDetail/StudentDetail";
import StudentList from "./Students/StudentList";
import TemplateList from "./Template/TemplateList";

const CustomRouter = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const isAdmin = userData?.studentRole === "0";

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
      <Route
        path="/member/member-list"
        element={
          userData?.collaboration ? <MemberList /> : renderNoPermission()
        }
      />
      <Route
        path="/member/report-detail/"
        element={
          userData?.collaboration ? <ReportDetail /> : renderNoPermission()
        }
      />
    </>
  );

  const projectRouter = () => (
    <>
      <Route path="/project/project-list" element={<ProjectList />} />
      <Route path="/project/project-detail/" element={<ProjectDetail />} />
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
        element={
          isAdmin || userData?.isLeader ? (
            <ProjectReportList />
          ) : (
            renderNoPermission()
          )
        }
      />
      <Route
        path="/project/project-report-detail"
        element={
          isAdmin || userData?.isLeader ? (
            <ProjectReportDetail />
          ) : (
            renderNoPermission()
          )
        }
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
      <Route path="/overview" element={<Overview />} />
      <Route path="/template" element={<TemplateList />} />
      <Route path="/scheduler" element={<SchedulerPage />} />
      <Route path="/chat-box" element={<ChatBox />} />
    </Routes>
  );
};

export default CustomRouter;
