using System.Collections.Generic;
using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SchedulerController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpGet()]
        [Route("getschedulers/{studentId?}")]
        public SchedulerModelResponse GetSchedulers(string? studentId)
        {
            if (studentId != "0")
            {
                var sr = db.ProjectStudentRelationship.FirstOrDefault(r =>
                    r.StudentId == studentId
                    && r.Status == (int)StudentRelationshipStatus.InProgress
                );
                if (sr == null)
                {
                    return new SchedulerModelResponse { SchedulerList = [], IsDone = true };
                }
                var p = db.Projects.FirstOrDefault(p => p.ProjectId == sr.ProjectId);
                var dbSc = db.Schedulers.Where(s => s.ProjectId == sr.ProjectId);
                var dbSt = db.Students.Where(s => s.Status != (int)StudentStatus.OutLab);

                var list =
                    from sc in dbSc
                    join st in dbSt on sc.CreatedBy equals st.StudentId into dbScCreate
                    from scCreate in dbScCreate.DefaultIfEmpty()
                    select new SchedulerTableModel
                    {
                        ProjectId = p.ProjectName,
                        SchedulerId = sc.SchedulerId,
                        EventType = sc.EventType,
                        StartDate = sc.StartDate,
                        EndDate = sc.EndDate,
                        Description = sc.Description,
                        CreatedBy = scCreate.StudentName,
                    };

                return new SchedulerModelResponse
                {
                    SchedulerList = [.. list],
                    IsDone = true,
                    ProjectId = sr.ProjectId,
                    IsLeader = sr.IsLeader,
                };
            }
            else
            {
                var dbSc = db.Schedulers;
                var dbSt = db.Students.Where(s => s.Status != (int)StudentStatus.OutLab);
                var dbP = db.Projects.Where(s => s.IsActive == true);

                var list =
                    from sc in dbSc
                    join st in dbSt on sc.CreatedBy equals st.StudentId into dbScCreate
                    from scCreate in dbScCreate.DefaultIfEmpty()
                    join p in dbP on sc.ProjectId equals p.ProjectId into dbScProject
                    from scProject in dbScProject.DefaultIfEmpty()
                    select new SchedulerTableModel
                    {
                        ProjectId = scProject.ProjectName,
                        SchedulerId = sc.SchedulerId,
                        EventType = sc.EventType,
                        StartDate = sc.StartDate,
                        EndDate = sc.EndDate,
                        Description = sc.Description,
                        CreatedBy = scCreate.StudentName,
                    };
                return new SchedulerModelResponse
                {
                    SchedulerList = [.. list],
                    IsDone = true,
                    ProjectId = "0",
                    IsLeader = true,
                };
            }
        }

        [HttpPost()]
        [Route("createscheduler")]
        public ResponseModel CreateScheduler([FromBody] SchedulerTableModel model)
        {
            var exsistSchedule = db.Schedulers.Any(s =>
                s.StartDate < model.StartDate && s.EndDate > model.StartDate
                || s.StartDate < model.EndDate && s.EndDate > model.EndDate
                || s.StartDate > model.StartDate && s.EndDate < model.EndDate
            );
            if (exsistSchedule == true)
            {
                return new ResponseModel
                {
                    IsDone = false,
                    ErrorCode = 101,
                    Error = "Exsist a schedule in selected time",
                };
            }
            model.SchedulerId = Guid.NewGuid().ToString();
            db.Schedulers.Add(model);
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = model.SchedulerId, IsDone = true };
        }
    }
}
