using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProjectController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpGet()]
        [Route("getprojectlist/{state?}")]
        public ProjectModelResponse GetProjectList(string? state)
        {
            var dbP = db.Projects.Where(p => p.IsActive == ConvertStatus(state));
            var dbR = db.ProjectStudentRelationship.Where(r =>
                r.IsLeader == true && r.Status == (int)StudentRelationshipStatus.InProgress
            );
            var dbS = db.Students.Where(s => s.Status != (int)StudentStatus.OutLab);
            var dbPT = db.ProjectType;

            IQueryable<ProjectTableModel> list;

            if (ConvertStatus(state))
            {
                list =
                    from p in dbP
                    join r in dbR on p.ProjectId equals r.ProjectId into dbPR
                    from pR in dbPR.DefaultIfEmpty()
                    join s in dbS on p.CreatedBy equals s.StudentId into dbPCreated
                    from pCreated in dbPCreated.DefaultIfEmpty()
                    join pt in dbPT on p.ProjectTypeId equals pt.ProjectTypeId into dbPType
                    from pType in dbPType.DefaultIfEmpty()
                    select new ProjectTableModel
                    {
                        ProjectId = p.ProjectId,
                        ProjectName = p.ProjectName,
                        Description = p.Description,
                        ProjectTypeId = pType.ProjectTypeName,
                        Collaboration = p.Collaboration,
                        Reason = p.Reason,
                        TotalMember = p.TotalMember,
                        CreatedBy = pCreated.StudentName,
                        CreatedDate = p.CreatedDate,
                    };
            }
            else
            {
                list =
                    from p in dbP
                    join r in dbR on p.ProjectId equals r.ProjectId into dbPR
                    from pR in dbPR.DefaultIfEmpty()
                    join s in dbS on p.RemovedBy equals s.StudentId into dbPRemoved
                    from pRemoved in dbPRemoved.DefaultIfEmpty()
                    join pt in dbPT on p.ProjectTypeId equals pt.ProjectTypeId into dbPType
                    from pType in dbPType.DefaultIfEmpty()
                    select new ProjectTableModel
                    {
                        ProjectId = p.ProjectId,
                        ProjectName = p.ProjectName,
                        Description = p.Description,
                        ProjectTypeId = pType.ProjectTypeName,
                        Collaboration = p.Collaboration,
                        Reason = p.Reason,
                        TotalMember = p.TotalMember,
                        RemovedBy = pRemoved.StudentName,
                        RemovedDate = p.RemovedDate,
                    };
            }

            return new ProjectModelResponse { ProjectList = [.. list], IsDone = true };
        }

        [HttpGet()]
        [Route("getprojectdetail/{projectId?}")]
        public ProjectDetailModelResponse GetProjectDetail(string? projectId)
        {
            var p = db.Projects.FirstOrDefault(p => p.ProjectId == projectId);
            if (p == null)
                return new ProjectDetailModelResponse
                {
                    IsDone = false,
                    Error = "Done exsist project",
                };
            var pCName = db.Students.FirstOrDefault(s => s.StudentId == p.CreatedBy)?.StudentName;
            string? pRName = null;
            if (p.IsActive == false)
            {
                pRName = db.Students.FirstOrDefault(s => s.StudentId == p.RemovedBy)?.StudentName;
            }
            var pT = db.ProjectType.FirstOrDefault(t => t.ProjectTypeId == p.ProjectTypeId);
            var dbR = db.ProjectStudentRelationship.Where(r =>
                r.ProjectId == projectId && r.Status == (int)StudentRelationshipStatus.InProgress
            );
            var dbS = db.Students.Where(student =>
                student.InProject == true && student.Status != (int)StudentStatus.OutLab
            );
            var rList =
                from r in dbR
                join s in dbS on r.StudentId equals s.StudentId into dbRS
                from rs in dbRS.DefaultIfEmpty()
                join s in dbS on r.CreatedBy equals s.StudentId into dbRCreate
                from rc in dbRCreate.DefaultIfEmpty()
                select new ProjectStudentRelationshipTableModel
                {
                    RelationshipId = r.RelationshipId,
                    ProjectId = projectId,
                    StudentId = rs.StudentName,
                    IsLeader = r.IsLeader,
                    CreatedDate = r.CreatedDate,
                    CreatedBy = rc.StudentName,
                };
            var projectDetail = new ProjectDetailModel
            {
                ProjectName = p.ProjectName,
                Description = p.Description,
                ProjectTypeId = pT?.ProjectTypeName,
                Collaboration = p.Collaboration,
                TotalMember = p.TotalMember,
                IsActive = p.IsActive,
                Reason = p.Reason,
                CreatedBy = pCName,
                CreatedDate = p.CreatedDate,
                RemovedBy = pRName,
                RemovedDate = p.RemovedDate,
                RelationshipList = [.. rList],
            };

            return new ProjectDetailModelResponse { IsDone = true, ProjectDetail = projectDetail };
        }

        [HttpPost()]
        [Route("createproject")]
        public ResponseModel CreateProject([FromBody] ProjectCreateModel model)
        {
            var sameName = db.Projects.Any(item => item.ProjectName == model.ProjectName);
            if (sameName)
            {
                return new ResponseModel
                {
                    IsDone = false,
                    Error = "There is a project with the same name!",
                    ErrorCode = 101,
                };
            }
            var newguid = Guid.NewGuid().ToString();
            var newP = new ProjectTableModel
            {
                ProjectId = newguid,
                ProjectName = model.ProjectName,
                Description = model.Description,
                ProjectTypeId = model.ProjectTypeId,
                Collaboration = model.Collaboration,
                TotalMember = model.TotalMember,
                IsActive = true,
                Reason = null,
                CreatedBy = model.CreatedBy,
                CreatedDate = model.CreatedDate,
            };
            foreach (StudentIdModel m in model.MemberList ?? [])
            {
                var edits = db.Students.FirstOrDefault(student => student.StudentId == m.StudentId);
                if (edits != null)
                {
                    edits.InProject = true;
                }
            }
            var newRMList = model
                .MemberList?.Select(
                    (member, index) =>
                        new ProjectStudentRelationshipTableModel
                        {
                            RelationshipId = Guid.NewGuid().ToString(),
                            ProjectId = newguid,
                            StudentId = member.StudentId,
                            IsLeader = index == 0,
                            CreatedDate = model.CreatedDate,
                            CreatedBy = model.CreatedBy,
                            Status = (int)StudentRelationshipStatus.InProgress,
                        }
                )
                .ToList();
            db.Projects.Add(newP);
            if (newRMList?.Count > 0)
            {
                db.ProjectStudentRelationship.AddRange(newRMList);
            }
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = newguid, IsDone = true };
        }

        [HttpPost()]
        [Route("deleteproject")]
        public ResponseModel DeleteProject([FromBody] DeleteProjectModel model)
        {
            var pD = db.Projects.FirstOrDefault(item => item.ProjectId == model.ProjectId);
            if (pD == null)
            {
                return new ResponseModel
                {
                    Id = model.ProjectId,
                    Error = "Project does not exsist !",
                };
            }
            else
            {
                pD.IsActive = false;
                pD.Reason = model.Reason;
                pD.RemovedBy = model.RemovedBy;
                pD.RemovedDate = model.RemovedDate;
                var dbR = db
                    .ProjectStudentRelationship.Where(r => r.ProjectId == pD.ProjectId)
                    .ToList();
                foreach (ProjectStudentRelationshipTableModel? r in dbR)
                {
                    r.RemovedDate = model.RemovedDate;
                    r.RemovedBy = model.RemovedBy;
                    r.Status = (int)StudentRelationshipStatus.EndProject;
                    var edits = db.Students.FirstOrDefault(student =>
                        student.StudentId == r.StudentId
                    );
                    if (edits != null)
                    {
                        edits.InProject = false;
                    }
                }
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }

                return new ResponseModel { Id = pD.ProjectId, IsDone = true };
            }
        }

        public static bool ConvertStatus(string? state)
        {
            if (state == "open")
            {
                return true;
            }
            return false;
        }
    }
}
