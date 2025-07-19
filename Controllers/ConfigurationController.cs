using System;
using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ConfigurationController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpGet()]
        [Route("getprojecttypelist/{currentPage?}")]
        public ProjectTypeModelResponse GetProjectTypeList(int? currentPage)
        {
            var dbS = db.Students;
            var dbT = db.ProjectType;
            var list =
                from r in dbT.Skip(((currentPage ?? 0) - 1) * 10).Take((currentPage ?? 0) * 10)
                join s in dbS on r.CreatedBy equals s.StudentId into newdbR
                from newR in newdbR.DefaultIfEmpty()
                select new ProjectTypeTableModel
                {
                    ProjectTypeId = r.ProjectTypeId,
                    ProjectTypeName = r.ProjectTypeName,
                    Description = r.Description,
                    CreatedBy = newR.StudentName,
                    CreatedDate = r.CreatedDate,
                    IsWeeklyReport = r.IsWeeklyReport,
                };
            return new ProjectTypeModelResponse
            {
                ProjectTypeList = [.. list],
                IsDone = true,
                Total = dbT.Count(),
            };
        }

        [HttpGet()]
        [Route("getprojecttypeidlist/{status?}")]
        public ProjectTypeModelResponse GetProjectTypeIdList(string? status)
        {
            IQueryable<ProjectTypeTableModel> list;
            if (status == "0")
            {
                list = db.ProjectType;
            }
            else
            {
                var isWeekly = status == "true";
                list = db.ProjectType.Where(t => t.IsWeeklyReport == isWeekly);
            }
            return new ProjectTypeModelResponse { ProjectTypeList = [.. list], IsDone = true };
        }

        [HttpPost()]
        [Route("createprojecttype")]
        public ResponseModel CreateProjectType([FromBody] ProjectTypeTableModel model)
        {
            ProjectTypeTableModel? pt = null;
            if (model.ProjectTypeId != null)
            {
                pt = db.ProjectType.FirstOrDefault(t => t.ProjectTypeId == model.ProjectTypeId);
            }
            var sameName = db.ProjectType.FirstOrDefault(item =>
                item.ProjectTypeName == model.ProjectTypeName
            );
            if (pt == null)
            {
                if (sameName != null)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a project type with the same name!",
                        ErrorCode = 101,
                    };
                }
                model.ProjectTypeId = Guid.NewGuid().ToString();
                db.ProjectType.Add(model);
            }
            else
            {
                if (sameName?.ProjectTypeId != model.ProjectTypeId)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a project type with the same name!",
                        ErrorCode = 101,
                    };
                }
                pt.ProjectTypeName = model.ProjectTypeName;
                pt.Description = model.Description;
                pt.CreatedDate = model.CreatedDate;
                pt.CreatedBy = model.CreatedBy;
            }
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = model.ProjectTypeId, IsDone = true };
        }

        [HttpGet()]
        [Route("deleteprojecttype/{typeId?}")]
        public ResponseModel DeleteProjectType(string? typeId)
        {
            var typeDel = db.ProjectType.FirstOrDefault(item => item.ProjectTypeId == typeId);
            if (typeDel == null)
            {
                return new ResponseModel { Id = typeId, Error = "Project Type does not exsist!" };
            }
            var pUseType = db.Projects.FirstOrDefault(item =>
                item.ProjectTypeId == typeDel.ProjectTypeId
            );
            if (pUseType != null)
            {
                return new ResponseModel
                {
                    Id = typeId,
                    Error = "There are a project is using this type!",
                };
            }
            db.ProjectType.Remove(typeDel);
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = typeId, IsDone = true };
        }

        [HttpGet()]
        [Route("getstudentrolelist/{currentPage?}")]
        public StudentRoleModelResponse GetStudentRoleList(int? currentPage)
        {
            var dbS = db.Students;
            var dbR = db.StudentRole;
            var list =
                from r in dbR.Skip(((currentPage ?? 0) - 1) * 10).Take((currentPage ?? 0) * 10)
                join s in dbS on r.CreatedBy equals s.StudentId into newdbR
                from newR in newdbR.DefaultIfEmpty()
                select new StudentRoleTableModel
                {
                    StudentRoleId = r.StudentRoleId,
                    StudentRoleName = r.StudentRoleName,
                    Description = r.Description,
                    CreatedBy = newR.StudentName,
                    CreatedDate = r.CreatedDate,
                };
            return new StudentRoleModelResponse
            {
                StudentRoleList = [.. list],
                IsDone = true,
                Total = dbR.Count(),
            };
        }

        [HttpGet()]
        [Route("getstudentroleidlist")]
        public StudentRoleModelResponse GetStudentRoleIdList()
        {
            return new StudentRoleModelResponse
            {
                StudentRoleList = [.. db.StudentRole],
                IsDone = true,
            };
        }

        [HttpPost()]
        [Route("createstudentrole")]
        public ResponseModel CreateStudentRole([FromBody] StudentRoleTableModel model)
        {
            StudentRoleTableModel? sr = null;
            if (model.StudentRoleId != null)
            {
                sr = db.StudentRole.FirstOrDefault(t => t.StudentRoleId == model.StudentRoleId);
            }
            var sameName = db.StudentRole.FirstOrDefault(item =>
                item.StudentRoleName == model.StudentRoleName
            );
            if (sr == null)
            {
                if (sameName != null)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a student role with the same name!",
                        ErrorCode = 101,
                    };
                }

                model.StudentRoleId = Guid.NewGuid().ToString();
                db.StudentRole.Add(model);
            }
            else
            {
                if (sameName?.StudentRoleId != model.StudentRoleId)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a project type with the same name!",
                        ErrorCode = 101,
                    };
                }
                sr.StudentRoleName = model.StudentRoleName;
                sr.Description = model.Description;
                sr.CreatedDate = model.CreatedDate;
                sr.CreatedBy = model.CreatedBy;
            }
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = model.StudentRoleId, IsDone = true };
        }

        [HttpGet()]
        [Route("deletestudentrole/{roleId?}")]
        public ResponseModel DeleteStudentRole(string? roleId)
        {
            var roleDel = db.StudentRole.FirstOrDefault(item => item.StudentRoleId == roleId);
            if (roleDel == null)
            {
                return new ResponseModel { Id = roleId, Error = "Student Role does not exsist !" };
            }
            else
            {
                var sUseType = db.Students.FirstOrDefault(item =>
                    item.StudentRole == roleDel.StudentRoleId
                );
                if (sUseType != null)
                {
                    return new ResponseModel
                    {
                        Id = roleId,
                        Error = "There are a student is using this role!",
                    };
                }
                db.StudentRole.Remove(roleDel);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }

                return new ResponseModel { Id = roleId, IsDone = true };
            }
        }
    }
}
