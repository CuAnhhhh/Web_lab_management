using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class ResponseModel
    {
        public string? Id { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
        public int? ErrorCode { get; set; }
    }

    public class FileUploadModel
    {
        public string? ServiceId { get; set; }
        public List<IFormFile>? File { get; set; }
        public string? ServiceType { get; set; }
        public int? exsistCount { get; set; }
    }

    public class FileTableModel
    {
        [Key]
        public string? FileId { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public string? ServiceType { get; set; }
        public string? ServiceId { get; set; }
    }

    public class FileGetModel
    {
        public string? ServiceType { get; set; }
        public string? ServiceId { get; set; }
    }

    public class StudentLoginModel
    {
        public string? UserName { get; set; }
        public string? PassWord { get; set; }
    }

    public class StudentLoginResponseModel
    {
        public string? StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentRole { get; set; }
        public string? ProjectId { get; set; }
        public bool? IsLeader { get; set; }
        public bool? IsCorrect { get; set; }
        public bool? Collaboration { get; set; }
    }
}
