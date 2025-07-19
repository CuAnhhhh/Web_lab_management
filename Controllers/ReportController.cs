using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ReportController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpGet()]
        [Route("getmemberreportdetail/{StudentId?}")]
        public ReportModelResponse GetMemberReportDetail(string? StudentId)
        {
            var rl = db.ProjectStudentRelationship.FirstOrDefault(r =>
                r.StudentId == StudentId && r.Status == (int)StudentRelationshipStatus.InProgress
            );
            if (rl == null)
            {
                return new ReportModelResponse
                {
                    IsDone = false,
                    Error = "Dont exsist current student report",
                };
            }
            var p = db.Projects.FirstOrDefault(p =>
                p.ProjectId == rl.ProjectId && p.IsActive == true
            );
            var t = db.ProjectType.FirstOrDefault(t => t.ProjectTypeId == p.ProjectTypeId);
            var list = db
                .Reports.Where(r =>
                    r.StudentId == StudentId
                    && r.ProjectId == rl.ProjectId
                    && r.IsProjectReport == false
                    && r.RelationshipId == rl.RelationshipId
                )
                .Select(r => new MemberReportModel
                {
                    ReportId = r.ReportId,
                    Comment = r.Comment,
                    StudentReport = r.StudentReport,
                    ProjectId = r.ProjectId,
                    StudentId = r.StudentId,
                    ReportedDate = r.ReportedDate,
                    ReportedWeek = r.ReportedWeek,
                });
            return new ReportModelResponse
            {
                IsDone = true,
                ReportList = [.. list],
                ProjectCreatedDate = p?.CreatedDate,
                IsWeeklyReport = t.IsWeeklyReport,
            };
        }

        [HttpGet()]
        [Route("getprojectreportdetail/{projectId?}")]
        public ReportModelResponse GetProjectReportDetail(string? projectId)
        {
            var p = db.Projects.FirstOrDefault(p => p.ProjectId == projectId && p.IsActive == true);
            if (p == null)
            {
                return new ReportModelResponse
                {
                    IsDone = false,
                    Error = "Dont exsist current project report",
                };
            }
            var t = db.ProjectType.FirstOrDefault(t => t.ProjectTypeId == p.ProjectTypeId);
            var dbS = db.Students.ToList();
            var memberRIds = db
                .ProjectStudentRelationship.Where(r => r.ProjectId == projectId)
                .Select(r => r.StudentId)
                .ToList();
            var memberList = dbS.Where(s =>
                s.StudentId != null && memberRIds.Contains(s.StudentId)
            );

            var listR = db.Reports.Where(r => r.ProjectId == projectId).ToList();
            var list = (
                from r in listR.Where(r => r.IsProjectReport == true)
                join s in dbS on r.StudentId equals s.StudentId into listRS
                from rs in listRS.DefaultIfEmpty()
                select new MemberReportModel
                {
                    ReportId = r.ReportId,
                    Comment = r.Comment,
                    StudentReport = r.StudentReport,
                    ProjectId = r.ProjectId,
                    StudentId = r.StudentId,
                    ReportedDate = r.ReportedDate,
                    ReportedWeek = r.ReportedWeek,
                    StudentName = rs.StudentName,
                }
            ).ToList();
            foreach (var item in list)
            {
                var rStudents =
                    from r in listR.Where(r =>
                        r.ReportedWeek == item.ReportedWeek && r.IsProjectReport == false
                    )
                    join m in memberList on r.StudentId equals m.StudentId into newRStudents
                    from sm in newRStudents.DefaultIfEmpty()
                    select new MemberReportModel
                    {
                        ReportId = r.ReportId,
                        ProjectId = r.ProjectId,
                        StudentId = r.StudentId,
                        ReportedDate = r.ReportedDate,
                        ReportedWeek = r.ReportedWeek,
                        StudentName = sm?.StudentName,
                    };
                item.MemberReportList = [.. rStudents];
            }
            return new ReportModelResponse
            {
                IsDone = true,
                ReportList = [.. list],
                ProjectCreatedDate = p?.CreatedDate,
                IsWeeklyReport = t?.IsWeeklyReport,
                IsMultiProject = p?.Collaboration,
            };
        }

        [HttpPost()]
        [Route("createreport")]
        public ResponseModel CreateReport([FromBody] ReportTableModel model)
        {
            if (model.ReportId == null)
            {
                model.ReportId = Guid.NewGuid().ToString();
                var rl = db.ProjectStudentRelationship.FirstOrDefault(r =>
                    r.StudentId == model.StudentId
                    && r.Status == (int)StudentRelationshipStatus.InProgress
                );
                model.RelationshipId = rl?.RelationshipId;
                model.ProjectId = rl?.ProjectId;
                db.Reports.Add(model);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }
            }
            var report = db.Reports.FirstOrDefault(r => r.ReportId == model.ReportId);
            if (report == null)
            {
                return new ResponseModel { IsDone = false, Error = "Doesn't exsist report" };
            }
            if (model.StudentReport == null)
            {
                report.Comment = model.Comment;
            }
            else
            {
                report.StudentReport = model.StudentReport;
                report.ReportedDate = model.ReportedDate;
            }
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }
            return new ResponseModel { IsDone = true, Id = model.ReportId };
        }

        [HttpGet()]
        [Route("getreportlist/{currentPage?}")]
        public StudentReportModelResponse GetReportListl(int? currentPage)
        {
            var dbR = db.ProjectStudentRelationship.Where(r =>
                r.Status == (int)StudentRelationshipStatus.InProgress && r.IsLeader == true
            );
            var dbRpage = dbR.Skip(((currentPage ?? 0) - 1) * 10).Take((currentPage ?? 0) * 10);
            var dbS = db.Students.Where(s => s.InProject == true);
            var dbP = db.Projects.Where(p => p.IsActive == true);

            var list =
                from rpage in dbRpage
                join s in dbS on rpage.StudentId equals s.StudentId into dbRStudent
                from rs in dbRStudent.DefaultIfEmpty()
                join p in dbP on rpage.ProjectId equals p.ProjectId into dbRProject
                from rp in dbRProject.DefaultIfEmpty()
                select new StudentReportModel
                {
                    StudentName = rs.StudentName,
                    StudentId = rs.StudentId,
                    HustId = rs.HustId,
                    ProjectName = rp.ProjectName,
                    PhoneNumber = rs.PhoneNumber,
                    Email = rs.Email,
                    ProjectId = rp.ProjectId,
                };
            return new StudentReportModelResponse
            {
                StudentList = [.. list],
                IsDone = true,
                Total = dbR.Count(),
            };
        }
    }
}
