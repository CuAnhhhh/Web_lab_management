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

        [HttpPost()]
        [Route("getprojectlist")]
        public ProjectModelResponse GetProjectList([FromBody] GetProjectListModel model)
        {
            var dbP = db.Projects.Where(p =>
                p.IsActive == model.State
                && (
                    model.SearchValue != null
                        ? p.ProjectTypeId == model.SearchValue
                        : p.ProjectTypeId != null
                )
            );
            var dbS = db.Students;
            var dbPT = db.ProjectType;

            IQueryable<ProjectTableModel> list;

            if (model.State == true)
            {
                list =
                    from p in dbP.Skip(((model.CurrentPage ?? 0) - 1) * 10)
                        .Take((model.CurrentPage ?? 0) * 10)
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
                    from p in dbP.Skip(((model.CurrentPage ?? 0) - 1) * 10)
                        .Take((model.CurrentPage ?? 0) * 10)
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

            return new ProjectModelResponse
            {
                ProjectList = [.. list],
                IsDone = true,
                Total = dbP.Count(),
            };
        }

        [HttpGet()]
        [Route("getprojectdetail/{projectId?}")]
        public ProjectDetailModelResponse GetProjectDetail(string? projectId)
        {
            var p = db.Projects.FirstOrDefault(p => p.ProjectId == projectId);
            if (p == null)
            {
                return new ProjectDetailModelResponse
                {
                    IsDone = false,
                    Error = "Done exsist project",
                };
            }
            var pCName = db.Students.FirstOrDefault(s => s.StudentId == p.CreatedBy)?.StudentName;
            var pRName = db.Students.FirstOrDefault(s => s.StudentId == p.RemovedBy)?.StudentName;
            var pT = db.ProjectType.FirstOrDefault(t => t.ProjectTypeId == p.ProjectTypeId);
            IQueryable<ProjectStudentRelationshipTableModel>? dbR = null;
            if (p.IsActive == true)
            {
                dbR = db.ProjectStudentRelationship.Where(r =>
                    r.ProjectId == projectId
                    && r.Status == (int)StudentRelationshipStatus.InProgress
                );
            }
            else
            {
                dbR = db.ProjectStudentRelationship.Where(r =>
                    r.ProjectId == projectId
                    && (
                        r.Status == (int)StudentRelationshipStatus.Completed
                        || r.Status == (int)StudentRelationshipStatus.EndProject
                    )
                );
            }
            var dbS = db.Students;
            var rList =
                from r in dbR
                join s in dbS on r.StudentId equals s.StudentId into dbRS
                from rs in dbRS.DefaultIfEmpty()
                join s in dbS on r.CreatedBy equals s.StudentId into dbRCreate
                from rc in dbRCreate.DefaultIfEmpty()
                select new ProjectStudentRelationshiplistModel
                {
                    RelationshipId = r.RelationshipId,
                    ProjectId = projectId,
                    StudentId = rs.StudentId,
                    StudentName = rs.StudentName,
                    IsLeader = r.IsLeader,
                    CreatedDate = r.CreatedDate,
                    CreatedBy = rc.StudentName,
                };
            var projectDetail = new ProjectDetailModel
            {
                ProjectId = p.ProjectId,
                ProjectName = p.ProjectName,
                Description = p.Description,
                isWeeklyReport = pT?.IsWeeklyReport,
                ProjectTypeId = pT?.ProjectTypeId,
                ProjectTypeName = pT?.ProjectTypeName,
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
            var sameName = db.Projects.FirstOrDefault(item =>
                item.ProjectName == model.ProjectName
            );
            if (model.ProjectId == null)
            {
                if (sameName != null)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a project with the same name!",
                        ErrorCode = 101,
                    };
                }
                model.ProjectId = Guid.NewGuid().ToString();
                var newP = new ProjectTableModel
                {
                    ProjectId = model.ProjectId,
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
                    var edits = db.Students.FirstOrDefault(student =>
                        student.StudentId == m.StudentId
                    );
                    edits.InProject = true;
                }
                var newRMList = model
                    .MemberList?.Select(
                        (member, index) =>
                            new ProjectStudentRelationshipTableModel
                            {
                                RelationshipId = Guid.NewGuid().ToString(),
                                ProjectId = model.ProjectId,
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
            }
            else
            {
                if (
                    sameName?.ProjectId != model.ProjectId
                    && sameName?.ProjectName == model.ProjectName
                )
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a project with the same name!",
                        ErrorCode = 101,
                    };
                }
                var p = db.Projects.FirstOrDefault(item => item.ProjectId == model.ProjectId);
                if (p != null)
                {
                    p.ProjectName = model.ProjectName;
                    p.Description = model.Description;
                    p.ProjectTypeId = model.ProjectTypeId;
                    p.TotalMember = model.TotalMember;
                    p.CreatedBy = model.CreatedBy;
                    p.CreatedDate = model.CreatedDate;
                    var memberList = (
                        db.ProjectStudentRelationship.Where(r =>
                            r.ProjectId == p.ProjectId
                            && r.Status == (int)StudentRelationshipStatus.InProgress
                        )
                    ).ToList();
                    var currentLeader = memberList.Find(m => m.IsLeader == true);
                    var newleaderId = model.MemberList?[0]?.StudentId;
                    if (currentLeader != null && currentLeader?.StudentId != newleaderId)
                    {
                        var exsist = memberList.FirstOrDefault(m => m.StudentId == newleaderId);
                        if (exsist != null)
                        {
                            currentLeader.RemovedBy = model.CreatedBy;
                            currentLeader.RemovedDate = model.CreatedDate;
                            currentLeader.Status = (int)StudentRelationshipStatus.Demote;

                            exsist.RemovedBy = model.CreatedBy;
                            exsist.RemovedDate = model.CreatedDate;
                            exsist.Status = (int)StudentRelationshipStatus.Promote;

                            var oldLeaderR = new ProjectStudentRelationshipTableModel
                            {
                                RelationshipId = Guid.NewGuid().ToString(),
                                ProjectId = model.ProjectId,
                                StudentId = currentLeader.StudentId,
                                IsLeader = false,
                                CreatedDate = model.CreatedDate,
                                CreatedBy = model.CreatedBy,
                                Status = (int)StudentRelationshipStatus.InProgress,
                            };
                            var newLeaderR = new ProjectStudentRelationshipTableModel
                            {
                                RelationshipId = Guid.NewGuid().ToString(),
                                ProjectId = model.ProjectId,
                                StudentId = exsist.StudentId,
                                IsLeader = true,
                                CreatedDate = model.CreatedDate,
                                CreatedBy = model.CreatedBy,
                                Status = (int)StudentRelationshipStatus.InProgress,
                            };

                            db.ProjectStudentRelationship.AddRange([newLeaderR, oldLeaderR]);
                        }
                        else
                        {
                            currentLeader.RemovedBy = model.CreatedBy;
                            currentLeader.RemovedDate = model.CreatedDate;
                            currentLeader.Status = (int)StudentRelationshipStatus.Removed;
                            var oldLeader = db.Students.FirstOrDefault(s =>
                                s.StudentId == currentLeader.StudentId
                            );
                            oldLeader.InProject = false;
                            var newLeader = db.Students.FirstOrDefault(s =>
                                s.StudentId == newleaderId
                            );
                            newLeader.InProject = true;

                            var newR = new ProjectStudentRelationshipTableModel
                            {
                                RelationshipId = Guid.NewGuid().ToString(),
                                ProjectId = model.ProjectId,
                                StudentId = newleaderId,
                                IsLeader = true,
                                CreatedDate = model.CreatedDate,
                                CreatedBy = model.CreatedBy,
                                Status = (int)StudentRelationshipStatus.InProgress,
                            };
                            db.ProjectStudentRelationship.Add(newR);
                        }
                    }
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

            return new ResponseModel { Id = model.ProjectId, IsDone = true };
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
                    .ProjectStudentRelationship.Where(r =>
                        r.ProjectId == pD.ProjectId
                        && r.Status == (int)StudentRelationshipStatus.InProgress
                    )
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

        [HttpGet()]
        [Route("getprojectlistname/{state?}")]
        public ProjectModelResponse GetProjectListName(int? state)
        {
            if (state == 0)
            {
                var list = db.Projects.Where(p => p.IsActive == true);
                return new ProjectModelResponse { ProjectList = [.. list], IsDone = true };
            }
            else
            {
                var list = db.Projects.Where(p => p.IsActive == true && p.Collaboration == true);
                return new ProjectModelResponse { ProjectList = [.. list], IsDone = true };
            }
        }

        [HttpPost()]
        [Route("completeproject")]
        public ResponseModel CompleteProject([FromBody] DeleteProjectModel model)
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
                    .ProjectStudentRelationship.Where(r =>
                        r.ProjectId == pD.ProjectId
                        && r.Status == (int)StudentRelationshipStatus.InProgress
                    )
                    .ToList();
                foreach (ProjectStudentRelationshipTableModel? r in dbR)
                {
                    r.RemovedDate = model.RemovedDate;
                    r.RemovedBy = model.RemovedBy;
                    r.Status = (int)StudentRelationshipStatus.Completed;
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
    }
}
