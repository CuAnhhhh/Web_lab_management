using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class StudentTableModel
    {
        [Key]
        public string? StudentId { get; set; }
        public int? HustId { get; set; }
        public string? StudentName { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public int? Nationality { get; set; }
        public bool? Gender { get; set; }
        public string? StudentRole { get; set; }
        public int? Status { get; set; }
        public bool? InProject { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? RemovedDate { get; set; }
        public string? RemovedBy { get; set; }
    }

    public class StudentModelResponse
    {
        public List<StudentTableModel>? StudentList { get; set; }
        public bool? IsDone { get; set; }
        public int? Total { get; set; }
        public string? Error { get; set; }
        public string? ProjectId { get; set; }
        public bool? IsLeader { get; set; }
    }

    public class StudentIdModel
    {
        public string? StudentId { get; set; }
        public string? StudentName { get; set; }
    }

    public class StudentIdModelResponse
    {
        public List<StudentIdModel>? StudentList { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }

    public class RelationshipStudentModel
    {
        public string? StudentId { get; set; }
        public string? ProjectId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
    }

    public class DeleteStudentModel
    {
        public string? StudentId { get; set; }
        public DateTime? RemovedDate { get; set; }
        public string? RemovedBy { get; set; }
    }

    public class ProjectHistoryModel
    {
        public string? ProjectName { get; set; }
        public bool? OnGoing { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? RemovedDate { get; set; }
        public string? RemovedBy { get; set; }
        public bool? IsLeader { get; set; }
        public int? Status { get; set; }
    }

    public class StudentDetailModel : StudentTableModel
    {
        public List<ProjectHistoryModel>? ProjectHistory { get; set; }
    }

    public class StudentDetailModelResponse
    {
        public StudentDetailModel? StudentDetail { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }

    public class StudentDetailEditModelResponse
    {
        public StudentTableModel? StudentDetail { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }

    public class StudentDetailResponseModel
    {
        public StudentDetailModel? StudentDetail { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }
}
