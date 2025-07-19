using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StudentController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpPost()]
        [Route("getstudentlist")]
        public StudentModelResponse GetStudentList([FromBody] GetStudentListModel model)
        {
            var allS = db.Students;
            IQueryable<StudentTableModel>? dbS;
            if (model.StudentRole == null)
            {
                dbS = db.Students.Where(s =>
                    ConvertStatus(model.Status)
                        ? s.Status != (int)StudentStatus.OutLab
                        : s.Status == (int)StudentStatus.OutLab
                );
            }
            else
            {
                dbS = db.Students.Where(s =>
                    s.Status != (int)StudentStatus.OutLab && s.StudentRole == model.StudentRole
                );
            }
            IQueryable<StudentTableModel> list;
            if (ConvertStatus(model.Status))
            {
                list =
                    from s in dbS.Skip(((model.CurrentPage ?? 0) - 1) * 10)
                        .Take((model.CurrentPage ?? 0) * 10)
                    join ls in allS on s.CreatedBy equals ls.StudentId into dbSCreate
                    from sCreate in dbSCreate.DefaultIfEmpty()
                    select new StudentTableModel
                    {
                        StudentId = s.StudentId,
                        StudentName = s.StudentName,
                        HustId = s.HustId,
                        Email = s.Email,
                        Address = s.Address,
                        PhoneNumber = s.PhoneNumber,
                        Nationality = s.Nationality,
                        Gender = s.Gender,
                        Status = s.Status,
                        CreatedBy = sCreate.StudentName,
                        CreatedDate = s.CreatedDate,
                    };
            }
            else
            {
                list =
                    from s in dbS.Skip(((model.CurrentPage ?? 0) - 1) * 10)
                        .Take((model.CurrentPage ?? 0) * 10)
                    join ls in allS on s.RemovedBy equals ls.StudentId into dbSRemove
                    from sRemove in dbSRemove.DefaultIfEmpty()
                    select new StudentTableModel
                    {
                        StudentId = s.StudentId,
                        StudentName = s.StudentName,
                        HustId = s.HustId,
                        Email = s.Email,
                        Address = s.Address,
                        PhoneNumber = s.PhoneNumber,
                        Nationality = s.Nationality,
                        Gender = s.Gender,
                        Status = s.Status,
                        RemovedBy = sRemove.StudentName,
                        RemovedDate = s.RemovedDate,
                    };
            }
            return new StudentModelResponse
            {
                StudentList = [.. list],
                IsDone = true,
                Total = dbS.Count(),
            };
        }

        [HttpPost()]
        [Route("getmemberlist")]
        public StudentReportModelResponse GetMemberList([FromBody] GetMemberModel model)
        {
            var dbS = db.Students.ToList();
            var dbR = db
                .ProjectStudentRelationship.Where(r =>
                    r.Status == (int)StudentRelationshipStatus.InProgress && r.IsLeader == false
                )
                .ToList();
            if (model.StudentId == "0")
            {
                IEnumerable<ProjectStudentRelationshipTableModel>? dbRList = null;
                if (model.Filter != null)
                {
                    dbRList = dbR.Where(r => r.ProjectId == model.Filter);
                }
                else
                {
                    dbRList = dbR;
                }
                IEnumerable<ProjectStudentRelationshipTableModel?> dbRpage;
                if (model.CurrentPage != 0)
                {
                    dbRpage = dbRList
                        .Skip(((model.CurrentPage ?? 0) - 1) * 10)
                        .Take((model.CurrentPage ?? 0) * 10);
                }
                else
                {
                    dbRpage = dbR;
                }
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
            else
            {
                var p = db.Projects.FirstOrDefault(p => p.ProjectId == model.ProjectId);
                var dbRList = dbR.Where(r => r.ProjectId == p.ProjectId);

                IEnumerable<ProjectStudentRelationshipTableModel?> dbRpage;
                if (model.CurrentPage != 0)
                {
                    dbRpage = dbRList
                        .Skip(((model.CurrentPage ?? 0) - 1) * 10)
                        .Take((model.CurrentPage ?? 0) * 10);
                }
                else
                {
                    dbRpage = dbRList;
                }
                var list =
                    from rpage in dbRpage
                    join s in dbS on rpage.StudentId equals s.StudentId into dbRStudent
                    from rs in dbRStudent.DefaultIfEmpty()
                    join s in dbS on rpage.CreatedBy equals s.StudentId into dbRCreateBy
                    from rc in dbRCreateBy.DefaultIfEmpty()
                    select new StudentReportModel
                    {
                        StudentName = rs.StudentName,
                        StudentId = rs.StudentId,
                        HustId = rs.HustId,
                        ProjectName = p.ProjectName,
                        PhoneNumber = rs.PhoneNumber,
                        Email = rs.Email,
                        ProjectId = p.ProjectId,
                        CreatedBy = rc?.StudentId,
                        CreatedByName = rc?.StudentName,
                        CreatedDate = rpage.CreatedDate,
                    };

                return new StudentReportModelResponse
                {
                    StudentList = [.. list],
                    TotalMember = p?.TotalMember,
                    Total = dbR.Count(),
                    IsDone = true,
                };
            }
        }

        [HttpGet()]
        [Route("getstudentidlist")]
        public StudentIdModelResponse GetStudentListId()
        {
            var list = db
                .Students.Where(student =>
                    student.InProject == false && student.Status != (int)StudentStatus.OutLab
                )
                .Select(student => new StudentIdModel
                {
                    StudentId = student.StudentId,
                    StudentName = student.StudentName,
                });
            return new StudentIdModelResponse { StudentList = [.. list], IsDone = true };
        }

        [HttpGet()]
        [Route("getstudentchatlist/{studentId?}")]
        public StudentIdModelResponse GetStudentChatList(string? studentId)
        {
            if (studentId == "0")
            {
                var list = db
                    .Students.Where(student => student.Status != (int)StudentStatus.OutLab)
                    .Select(student => new StudentIdModel
                    {
                        StudentId = student.StudentId,
                        StudentName = student.StudentName,
                    });
                return new StudentIdModelResponse { StudentList = [.. list], IsDone = true };
            }
            if (studentId != null)
            {
                var rs = db.ProjectStudentRelationship.FirstOrDefault(r =>
                    r.StudentId == studentId
                    && r.Status == (int)StudentRelationshipStatus.InProgress
                );
                if (rs == null)
                {
                    return new StudentIdModelResponse
                    {
                        IsDone = false,
                        Error = "Current student not in any project",
                    };
                }
                var dbR = db.ProjectStudentRelationship.Where(r =>
                    r.ProjectId == rs.ProjectId
                    && r.Status == (int)StudentRelationshipStatus.InProgress
                    && r.StudentId != rs.StudentId
                );
                var dbS = db
                    .Students.Where(student =>
                        student.InProject == true && student.Status != (int)StudentStatus.OutLab
                    )
                    .Select(student => new StudentIdModel
                    {
                        StudentId = student.StudentId,
                        StudentName = student.StudentName,
                    });
                var list =
                    from r in dbR
                    join s in dbS on r.StudentId equals s.StudentId into dbRS
                    from RS in dbRS.DefaultIfEmpty()
                    select new StudentIdModel
                    {
                        StudentId = r.StudentId,
                        StudentName = RS.StudentName,
                    };
                return new StudentIdModelResponse { StudentList = [.. list], IsDone = true };
            }
            return new StudentIdModelResponse { IsDone = false };
        }

        [HttpPost()]
        [Route("createstudent")]
        public ResponseModel CreateStudent([FromBody] StudentTableModel model)
        {
            if (model.StudentId == null)
            {
                var sameName = db.Students.FirstOrDefault(s => s.HustId == model.HustId);
                if (sameName != null)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a student with the same HUST ID!",
                        ErrorCode = 101,
                    };
                }
                model.StudentId = Guid.NewGuid().ToString();
                model.InProject = false;
                db.Students.Add(model);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }
            }
            var s = db.Students.FirstOrDefault(s => s.StudentId == model.StudentId);
            if (s == null)
            {
                return new ResponseModel { IsDone = false, Error = "Doesn't exsist student" };
            }
            s.StudentName = model.StudentName;
            s.HustId = model.HustId;
            s.Email = model.Email;
            s.Address = model.Address;
            s.PhoneNumber = model.PhoneNumber;
            s.Nationality = model.Nationality;
            s.Gender = model.Gender;
            s.Status = model.Status;
            s.StudentRole = model.StudentRole;
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = model.StudentId, IsDone = true };
        }

        [HttpPost()]
        [Route("deletestudent")]
        public ResponseModel DeleteStudent(DeleteStudentModel model)
        {
            var studentDel = db.Students.FirstOrDefault(item => item.StudentId == model.StudentId);
            if (studentDel == null)
            {
                return new ResponseModel
                {
                    Id = model.StudentId,
                    Error = "Student does not exsist !",
                };
            }
            else
            {
                studentDel.Status = (int)StudentStatus.OutLab;
                studentDel.RemovedBy = model.RemovedBy;
                studentDel.RemovedDate = model.RemovedDate;
                if (studentDel.InProject == true)
                {
                    var rDel = db.ProjectStudentRelationship.FirstOrDefault(r =>
                        r.StudentId == studentDel.StudentId
                        && r.Status == (int)StudentRelationshipStatus.InProgress
                    );
                    rDel.RemovedDate = model.RemovedDate;
                    rDel.RemovedBy = model.RemovedBy;
                    rDel.Status = (int)StudentRelationshipStatus.OutLab;
                    studentDel.InProject = false;
                }
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }

                return new ResponseModel { Id = model.StudentId, IsDone = true };
            }
        }

        [HttpPost()]
        [Route("addstudent")]
        public ResponseModel AddStudent([FromBody] RelationshipStudentModel model)
        {
            var s = db.Students.FirstOrDefault(item => item.StudentId == model.StudentId);
            var p = db.Projects.FirstOrDefault(item => item.ProjectId == model.ProjectId);
            if (s == null || p == null)
            {
                return new ResponseModel
                {
                    Id = model.StudentId,
                    Error = "Student or Project does not exsist !",
                };
            }
            else
            {
                s.InProject = true;
                var r = new ProjectStudentRelationshipTableModel
                {
                    RelationshipId = Guid.NewGuid().ToString(),
                    ProjectId = p.ProjectId,
                    StudentId = s.StudentId,
                    IsLeader = false,
                    CreatedDate = model.CreatedDate,
                    CreatedBy = model.CreatedBy,
                    Status = (int)StudentRelationshipStatus.InProgress,
                };
                db.ProjectStudentRelationship.Add(r);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }

                return new ResponseModel { Id = s.StudentId, IsDone = true };
            }
        }

        [HttpPost()]
        [Route("removestudent")]
        public ResponseModel RemoveStudent([FromBody] RelationshipStudentModel model)
        {
            var s = db.Students.FirstOrDefault(item => item.StudentId == model.StudentId);
            var p = db.Projects.FirstOrDefault(item => item.ProjectId == model.ProjectId);
            if (s == null || p == null)
            {
                return new ResponseModel
                {
                    Id = model?.StudentId,
                    Error = "Student or Project does not exsist !",
                };
            }
            else
            {
                s.InProject = false;
                var r = db.ProjectStudentRelationship.FirstOrDefault(r =>
                    r.StudentId == s.StudentId
                    && r.ProjectId == p.ProjectId
                    && r.Status == (int)StudentRelationshipStatus.InProgress
                );
                r.Status = (int)StudentRelationshipStatus.Removed;
                r.RemovedBy = model.CreatedBy;
                r.RemovedDate = model.CreatedDate;
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }

                return new ResponseModel { Id = s.StudentId, IsDone = true };
            }
        }

        [HttpPost()]
        [Route("studentlogin")]
        public StudentLoginResponseModel Login([FromBody] StudentLoginModel model)
        {
            if (model.UserName == "admin" && model.PassWord == "admin")
            {
                return new StudentLoginResponseModel
                {
                    StudentId = "0",
                    StudentRole = "0",
                    ProjectId = "0",
                    IsLeader = true,
                    IsCorrect = true,
                    Collaboration = true,
                };
            }
            var user = db.Students.FirstOrDefault(s =>
                s.HustId.ToString() == model.UserName
                && s.PhoneNumber == model.PassWord
                && s.Status != (int)StudentStatus.OutLab
            );
            if (user == null)
            {
                return new StudentLoginResponseModel { IsCorrect = false };
            }
            var userR = db.ProjectStudentRelationship.FirstOrDefault(r =>
                r.StudentId == user.StudentId
                && r.Status == (int)StudentRelationshipStatus.InProgress
            );
            ProjectTableModel? userP = null;
            if (userR?.ProjectId != null)
            {
                userP = db.Projects.FirstOrDefault(p =>
                    p.ProjectId == userR.ProjectId && p.IsActive == true
                );
            }
            return new StudentLoginResponseModel
            {
                StudentId = user.StudentId,
                StudentName = user.StudentName,
                StudentRole = user.StudentRole,
                ProjectId = userR?.ProjectId,
                IsLeader = userR?.IsLeader,
                IsCorrect = true,
                Collaboration = userP?.Collaboration,
            };
        }

        [HttpGet()]
        [Route("getstudentdetail/{studentId?}")]
        public async Task<StudentDetailResponseModel> GetStudentDetail(string? studentId)
        {
            var sDetail = db.Students.FirstOrDefault(s => s.StudentId == studentId);
            if (sDetail == null)
            {
                return new StudentDetailResponseModel
                {
                    IsDone = false,
                    Error = "Student don't exsist",
                };
            }
            else
            {
                var dbS = db.Students.Where(s => s.Status != (int)StudentStatus.OutLab);
                var cBy = db.Students.FirstOrDefault(s => s.StudentId == sDetail.CreatedBy);
                var sRole = db.StudentRole.FirstOrDefault(r =>
                    r.StudentRoleId == sDetail.StudentRole
                );
                var dbP = db.Projects;
                var dbR = db
                    .ProjectStudentRelationship.Where(r => r.StudentId == studentId)
                    .OrderBy(r => r.CreatedDate);
                var list = await (
                    from r in dbR
                    join p in dbP on r.ProjectId equals p.ProjectId into rpHistories
                    from rpHistory in rpHistories.DefaultIfEmpty()
                    join s in dbS on r.CreatedBy equals s.StudentId into dbPCreated
                    from pCreated in dbPCreated.DefaultIfEmpty()
                    join s in dbS on r.RemovedBy equals s.StudentId into dbPRemoved
                    from pRemoved in dbPRemoved.DefaultIfEmpty()
                    select new ProjectHistoryModel
                    {
                        RelationshipId = r.RelationshipId,
                        ProjectId = rpHistory.ProjectId,
                        ProjectName = rpHistory.ProjectName,
                        OnGoing = rpHistory.IsActive,
                        CreatedDate = r.CreatedDate,
                        CreatedBy = pCreated.StudentName,
                        RemovedDate = r.RemovedDate,
                        RemovedBy = pRemoved.StudentName,
                        IsLeader = r.IsLeader,
                        Collaboration = rpHistory.Collaboration,
                        Status = r.Status,
                        ProjectCreatedDate = rpHistory.CreatedDate,
                    }
                ).ToListAsync();

                foreach (ProjectHistoryModel? item in list)
                {
                    if (item != null)
                    {
                        var ReportCount = db
                            .Reports.Where(r =>
                                r.StudentId == studentId
                                && r.ProjectId == item.ProjectId
                                && r.RelationshipId == item.RelationshipId
                            )
                            .Count();
                        item.ReportCount = ReportCount;
                    }
                }
                var studentDetail = new StudentDetailModel
                {
                    StudentId = sDetail.StudentId,
                    StudentName = sDetail.StudentName,
                    HustId = sDetail.HustId,
                    Email = sDetail.Email,
                    Address = sDetail.Address,
                    PhoneNumber = sDetail.PhoneNumber,
                    Nationality = sDetail.Nationality,
                    Gender = sDetail.Gender,
                    Status = sDetail.Status,
                    CreatedBy = cBy?.StudentName,
                    CreatedDate = sDetail.CreatedDate,
                    StudentRole = sRole?.StudentRoleName,
                    InProject = sDetail.InProject,
                    ProjectHistory = list,
                };

                return new StudentDetailResponseModel
                {
                    StudentDetail = studentDetail,
                    IsDone = true,
                };
            }
        }

        [HttpGet()]
        [Route("getstudentdetailedit/{studentId?}")]
        public StudentDetailEditModelResponse GetStudentDetailEdit(string? studentId)
        {
            var sDetail = db.Students.FirstOrDefault(s => s.StudentId == studentId);
            if (sDetail == null)
            {
                return new StudentDetailEditModelResponse
                {
                    IsDone = false,
                    Error = "Student don't exsist",
                };
            }
            return new StudentDetailEditModelResponse { IsDone = true, StudentDetail = sDetail };
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
