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

        [HttpGet()]
        [Route("gettemplatelist")]
        public TemplateModelResponse GetTemplateList()
        {
            var dbT = db.Templates;
            var dbS = db.Students;

            var list =
                from t in dbT
                join s in dbS on t.CreatedBy equals s.StudentId into newdbT
                from newT in newdbT.DefaultIfEmpty()
                select new TemplateTableModel
                {
                    TemplateId = t.TemplateId,
                    TemplateName = t.TemplateName,
                    Description = t.Description,
                    CreatedDate = t.CreatedDate,
                    CreatedBy = newT.StudentName,
                };
            return new TemplateModelResponse { TemplateList = [.. list], IsDone = true };
        }

        [HttpPost()]
        [Route("createtemplate")]
        public ResponseModel CreateTemplate([FromBody] TemplateTableModel model)
        {
            if (model.TemplateId == null)
            {
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
            var template = db.Templates.FirstOrDefault(t => t.TemplateId == model.TemplateId);
            if (template == null)
            {
                return new ResponseModel { IsDone = false, Error = "Doesn't exsist template" };
            }
            template.TemplateName = model.TemplateName;
            template.Description = model.Description;
            template.CreatedDate = model.CreatedDate;
            template.CreatedBy = model.CreatedBy;
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
