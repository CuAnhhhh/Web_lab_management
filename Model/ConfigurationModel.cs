using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class ProjectTypeTableModel
    {
        [Key]
        public string? ProjectTypeId { get; set; }
        public string? ProjectTypeName { get; set; }
        public string? Description { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    public class ProjectTypeModelResponse
    {
        public List<ProjectTypeTableModel>? ProjectTypeList { get; set; }
        public bool? IsDone { get; set; }
        public int? Total { get; set; }
        public string? Error { get; set; }
    }

    public class StudentRoleTableModel
    {
        [Key]
        public string? StudentRoleId { get; set; }
        public string? StudentRoleName { get; set; }
        public string? Description { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    public class StudentRoleModelResponse
    {
        public List<StudentRoleTableModel>? StudentRoleList { get; set; }
        public bool? IsDone { get; set; }
        public int? Total { get; set; }
        public string? Error { get; set; }
    }
}
