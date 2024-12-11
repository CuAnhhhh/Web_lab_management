using System.Net;
using System.Reflection;
using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StudentController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpGet()]
        [Route("getstudentlist/{status?}")]
        public StudentModelResponse GetStudentList(string? status)
        {
            var allS = db.Students;
            var dbS = db.Students.Where(s =>
                ConvertStatus(status)
                    ? s.Status != (int)StudentStatus.OutLab
                    : s.Status == (int)StudentStatus.OutLab
            );

            var list =
                from s in dbS
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
            return new StudentModelResponse { StudentList = [.. list], IsDone = true };
        }

        [HttpGet()]
        [Route("getmemberlist/{studentId?}")]
        public StudentModelResponse GetMemberList(string? studentId)
        {
            if (studentId == "0")
            {
                var dbId = db
                    .ProjectStudentRelationship.Where(r =>
                        r.Status == (int)StudentRelationshipStatus.InProgress && r.IsLeader == false
                    )
                    .Select(r => r.StudentId);
                var dbS = db.Students.Where(s => s.InProject == true);
                var list = from id in dbId join s in dbS on id equals s.StudentId select s;
                return new StudentModelResponse { StudentList = [.. list], IsDone = true };
            }

            var r = db.ProjectStudentRelationship.FirstOrDefault(r =>
                r.StudentId == studentId && r.Status == (int)StudentRelationshipStatus.InProgress
            );
            if (r == null)
            {
                return new StudentModelResponse
                {
                    IsDone = false,
                    Error = "Don't exsist the project have current student",
                };
            }
            else
            {
                var p = db.Projects.FirstOrDefault(p => p.ProjectId == r.ProjectId);
                var dbId = db
                    .ProjectStudentRelationship.Where(r =>
                        r.ProjectId == p.ProjectId
                        && r.Status == (int)StudentRelationshipStatus.InProgress
                        && r.IsLeader == false
                    )
                    .Select(r => r.StudentId);
                var dbS = db.Students.Where(s => s.InProject == true);
                var list = from id in dbId join s in dbS on id equals s.StudentId select s;
                return new StudentModelResponse
                {
                    StudentList = [.. list],
                    Total = p?.TotalMember,
                    IsDone = true,
                    ProjectId = p.ProjectId,
                    IsLeader = r.IsLeader,
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

        [HttpPost()]
        [Route("createstudent")]
        public ResponseModel CreateStudent([FromBody] StudentTableModel model)
        {
            if (model.StudentId == null)
            {
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
            s.CreatedBy = model.CreatedBy;
            s.CreatedDate = model.CreatedDate;
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
                studentDel.InProject = false;
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
                    IsCorrect = true,
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
            return new StudentLoginResponseModel
            {
                StudentId = user.StudentId,
                StudentRole = user.StudentRole,
                IsCorrect = true,
            };
        }

        [HttpGet()]
        [Route("getstudentdetail/{studentId?}")]
        public StudentDetailResponseModel GetStudentDetail(string? studentId)
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
                var dbR = db.ProjectStudentRelationship.Where(r => r.StudentId == studentId);
                var list =
                    from r in dbR
                    join p in dbP on r.ProjectId equals p.ProjectId into rpHistories
                    from rpHistory in rpHistories.DefaultIfEmpty()
                    join s in dbS on r.CreatedBy equals s.StudentId into dbPCreated
                    from pCreated in dbPCreated.DefaultIfEmpty()
                    join s in dbS on r.RemovedBy equals s.StudentId into dbPRemoved
                    from pRemoved in dbPRemoved.DefaultIfEmpty()
                    select new ProjectHistoryModel
                    {
                        ProjectName = rpHistory.ProjectName,
                        OnGoing = rpHistory.IsActive,
                        CreatedDate = r.CreatedDate,
                        CreatedBy = pCreated.StudentName,
                        RemovedDate = r.RemovedDate,
                        RemovedBy = pRemoved.StudentName,
                        IsLeader = r.IsLeader,
                        Status = r.Status,
                    };

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
                    ProjectHistory = [.. list],
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
