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
        [Route("getprojecttypelist")]
        public ProjectTypeModelResponse GetProjectTypeList()
        {
            var dbS = db.Students;
            var list =
                from r in db.ProjectType
                join s in dbS on r.CreatedBy equals s.StudentId into newdbR
                from newR in newdbR.DefaultIfEmpty()
                select new ProjectTypeTableModel
                {
                    ProjectTypeId = r.ProjectTypeId,
                    ProjectTypeName = r.ProjectTypeName,
                    Description = r.Description,
                    CreatedBy = newR.StudentName,
                    CreatedDate = r.CreatedDate,
                };
            return new ProjectTypeModelResponse { ProjectTypeList = [.. list], IsDone = true };
        }

        [HttpPost()]
        [Route("createprojecttype")]
        public ResponseModel CreateProjectType([FromBody] ProjectTypeTableModel model)
        {
            var sameName = db.ProjectType.Any(item =>
                item.ProjectTypeName == model.ProjectTypeName
            );
            if (sameName)
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
                return new ResponseModel { Id = typeId, Error = "Project Type does not exsist !" };
            }
            else
            {
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
        }

        [HttpGet()]
        [Route("getstudentrolelist")]
        public StudentRoleModelResponse GetStudentRoleList()
        {
            var dbS = db.Students;
            var list =
                from r in db.StudentRole
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
            return new StudentRoleModelResponse { StudentRoleList = [.. list], IsDone = true };
        }

        [HttpPost()]
        [Route("createstudentrole")]
        public ResponseModel CreateStudentRole([FromBody] StudentRoleTableModel model)
        {
            var sameName = db.StudentRole.Any(item =>
                item.StudentRoleName == model.StudentRoleName
            );
            if (sameName)
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
