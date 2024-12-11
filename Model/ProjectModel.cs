using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class ProjectTableModel
    {
        [Key]
        public string? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string? Description { get; set; }
        public string? ProjectTypeId { get; set; }
        public bool? Collaboration { get; set; }
        public int? TotalMember { get; set; }
        public bool? IsActive { get; set; }
        public string? Reason { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? RemovedBy { get; set; }
        public DateTime? RemovedDate { get; set; }
    }

    public class DeleteProjectModel
    {
        public string? ProjectId { get; set; }
        public DateTime? RemovedDate { get; set; }
        public string? RemovedBy { get; set; }
        public string? Reason { get; set; }
    }

    public class ProjectCreateModel : ProjectTableModel
    {
        public List<StudentIdModel>? MemberList { get; set; }
    }

    public class ProjectModelResponse
    {
        public List<ProjectTableModel>? ProjectList { get; set; }
        public bool? IsDone { get; set; }
        public int? Total { get; set; }
        public string? Error { get; set; }
    }

    public class ProjectDetailModel : ProjectTableModel
    {
        public List<ProjectStudentRelationshipTableModel>? RelationshipList { get; set; }
    }

    public class ProjectDetailModelResponse
    {
        public ProjectDetailModel? ProjectDetail { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }
}
