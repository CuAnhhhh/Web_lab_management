using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TemplateController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpPost()]
        [Route("gettemplatelist")]
        public TemplateModelResponse GetTemplateList([FromBody] GetTemplateListModel model)
        {
            IQueryable<TemplateTableModel> dbT;
            if (model.ProjectId == "0")
            {
                dbT = db.Templates;
            }
            else
            {
                dbT = db.Templates.Where(t => t.ProjectId == model.ProjectId || t.ProjectId == "0");
            }
            var dbS = db.Students;

            var list =
                from t in dbT.Skip(((model.CurrentPage ?? 0) - 1) * 10)
                    .Take((model.CurrentPage ?? 0) * 10)
                join s in dbS on t.CreatedBy equals s.StudentId into newdbT
                from newT in newdbT.DefaultIfEmpty()
                select new TemplateListModel
                {
                    TemplateId = t.TemplateId,
                    TemplateName = t.TemplateName,
                    Description = t.Description,
                    ProjectId = t.ProjectId,
                    CreatedDate = t.CreatedDate,
                    CreatedBy = t.CreatedBy,
                    CreatedByName = newT.StudentName,
                };
            return new TemplateModelResponse
            {
                TemplateList = [.. list],
                IsDone = true,
                Total = dbT.Count(),
            };
        }

        [HttpPost()]
        [Route("createtemplate")]
        public ResponseModel CreateTemplate([FromBody] TemplateTableModel model)
        {
            TemplateTableModel? template = null;
            if (model.TemplateId != null)
            {
                template = db.Templates.FirstOrDefault(t => t.TemplateId == model.TemplateId);
            }
            var sameName = db.Templates.FirstOrDefault(item =>
                item.TemplateName == model.TemplateName
            );
            if (template == null)
            {
                if (sameName != null)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a template with the same name!",
                        ErrorCode = 101,
                    };
                }
                model.TemplateId = Guid.NewGuid().ToString();
                db.Templates.Add(model);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }
            }
            else
            {
                if (sameName?.TemplateId != model.TemplateId)
                {
                    return new ResponseModel
                    {
                        IsDone = false,
                        Error = "There is a template with the same name!",
                        ErrorCode = 101,
                    };
                }
                template.TemplateName = model.TemplateName;
                template.Description = model.Description;
                template.CreatedDate = model.CreatedDate;
                template.CreatedBy = model.CreatedBy;
            }
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = model.TemplateId, IsDone = true };
        }

        [HttpGet()]
        [Route("deletetemplate/{templateid?}")]
        public ResponseModel DeleteTemplate(string? templateid)
        {
            var templateDel = db.Templates.FirstOrDefault(item => item.TemplateId == templateid);
            if (templateDel == null)
            {
                return new ResponseModel { Id = templateid, Error = "Template does not exsist !" };
            }
            else
            {
                db.Templates.Remove(templateDel);
                var fileDels = db.Files.Where(f =>
                    f.ServiceId == templateid && f.ServiceType == "templates"
                );
                if (fileDels != null)
                {
                    foreach (var file in fileDels)
                    {
                        var filePath = Path.Combine(
                            Directory.GetCurrentDirectory(),
                            @"wwwroot",
                            file.FileUrl ?? ""
                        );
                        if (!System.IO.File.Exists(filePath))
                            continue;
                        try
                        {
                            System.IO.File.Delete(filePath);
                        }
                        catch (Exception)
                        {
                            continue;
                        }
                    }
                    db.Files.RemoveRange(fileDels);
                }

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }
                return new ResponseModel { Id = templateid, IsDone = true };
            }
        }
    }
}
