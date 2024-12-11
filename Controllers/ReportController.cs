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

        [HttpPost()]
        [Route("getreportdetail")]
        public ReportModelResponse GetReportDetail([FromBody] GetReportModel model)
        {
            var rl = db.ProjectStudentRelationship.FirstOrDefault(r =>
                r.StudentId == model.StudentId
                && r.Status == (int)StudentRelationshipStatus.InProgress
                && r.IsLeader == false
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
            var cr = db.ProjectStudentRelationship.FirstOrDefault(r =>
                r.StudentId == model.CurrentId
                && r.ProjectId == rl.ProjectId
                && r.Status == (int)StudentRelationshipStatus.InProgress
            );
            var list = db.Reports.Where(r =>
                r.StudentId == model.StudentId && r.ProjectId == rl.ProjectId
            );
            return new ReportModelResponse
            {
                IsDone = true,
                ReportList = [.. list],
                IsLeader = model.CurrentId == "0" ? true : cr?.IsLeader,
                ProjectCreatedDate = p?.CreatedDate,
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
                report.StudentScore = model.StudentScore;
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
    }
}
