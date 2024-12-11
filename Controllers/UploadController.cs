using Azure.Core;
using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UploadController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpPost()]
        [Route("getfilelist")]
        public List<FileTableModel> GetFileList([FromBody] FileGetModel model)
        {
            var list = db.Files.Where(f =>
                f.ServiceId == model.ServiceId && f.ServiceType == model.ServiceType
            );
            return [.. list];
        }

        [HttpPost]
        [Route("uploadfile")]
        public ResponseModel UploadFile([FromForm] FileUploadModel model)
        {
            if (model.File != null && model.File.Count > 0)
            {
                List<FileTableModel> FilesList = [];
                foreach (var (file, index) in model.File.Select((f, i) => (f, i)))
                {
                    var fileName =
                        $"{model.ServiceId}_{index + (model.exsistCount ?? 0)}{Path.GetExtension(file.FileName)}";
                    FileTableModel FileItem = new()
                    {
                        FileId = Guid.NewGuid().ToString(),
                        ServiceType = model.ServiceType,
                        FileName = Path.GetFileName(file.FileName),
                        ServiceId = model.ServiceId,
                    };
                    var filePath = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        @"wwwroot",
                        model.ServiceType ?? "",
                        fileName
                    );
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        file.CopyTo(fileStream);
                    }
                    FileItem.FileUrl = @$"{FileItem.ServiceType}/{fileName}";
                    FilesList.Add(FileItem);
                }
                db.Files.AddRange(FilesList);
                try
                {
                    db.SaveChanges();
                    return new ResponseModel { IsDone = true, Id = model.ServiceId };
                }
                catch (DbUpdateException ex)
                {
                    return new ResponseModel { IsDone = false, Error = ex.Message };
                }
            }
            return new ResponseModel { IsDone = false, Error = "Don't exsist anyfile" };
        }

        [HttpGet]
        [Route("deletefile/{fileId?}")]
        public ResponseModel DeleteFile(string? fileId)
        {
            var fileDel = db.Files.FirstOrDefault(f => f.FileId == fileId);
            if (fileDel == null)
            {
                return new ResponseModel { IsDone = false, Error = "File don't exsist" };
            }
            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                @"wwwroot",
                fileDel.FileUrl ?? ""
            );
            if (!System.IO.File.Exists(filePath))
            {
                return new ResponseModel { IsDone = false, Error = "Don't exsist anyfile" };
            }
            try
            {
                System.IO.File.Delete(filePath);
            }
            catch (Exception ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }
            db.Files.Remove(fileDel);
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }
            return new ResponseModel { Id = fileId, IsDone = true };
        }

        [HttpPost()]
        [Route("downloadfile")]
        public IActionResult DownloadFile(FileGetModel model)
        {
            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                @"wwwroot",
                model?.ServiceType ?? "",
                model?.ServiceId ?? ""
            );
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            return PhysicalFile(filePath, "application/octet-stream");
        }
    }
}
