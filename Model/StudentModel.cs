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
    }

    public class StudentIdModel
    {
        public string? StudentId { get; set; }
        public string? StudentName { get; set; }
    }

    public class GetStudentListModel
    {
        public string? Status { get; set; }
        public int? CurrentPage { get; set; }
        public string? StudentRole { get; set; }
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
        public string? RelationshipId { get; set; }
        public string? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public bool? OnGoing { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? RemovedDate { get; set; }
        public string? RemovedBy { get; set; }
        public bool? IsLeader { get; set; }
        public int? Status { get; set; }
        public bool? Collaboration { get; set; }
        public int? ReportCount { get; set; }
        public DateTime? ProjectCreatedDate { get; set; }
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

    public class GetMemberModel
    {
        public string? StudentId { get; set; }
        public int? CurrentPage { get; set; }
        public string? ProjectId { get; set; }
        public string? Filter { get; set; }
    }

    public class StudentReportModel : StudentTableModel
    {
        public string? CreatedByName { get; set; }
        public string? ProjectName { get; set; }
        public string? ProjectId { get; set; }
    }

    public class StudentReportModelResponse
    {
        public List<StudentReportModel>? StudentList { get; set; }
        public bool? IsDone { get; set; }
        public int? Total { get; set; }
        public int? TotalMember { get; set; }
        public string? Error { get; set; }
    }
}
