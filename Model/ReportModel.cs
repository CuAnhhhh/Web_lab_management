using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class ReportTableModel
    {
        [Key]
        public string? ReportId { get; set; }
        public string? RelationshipId { get; set; }
        public string? ProjectId { get; set; }
        public string? StudentId { get; set; }
        public string? Comment { get; set; }
        public string? StudentReport { get; set; }
        public DateTime? ReportedDate { get; set; }
        public int? ReportedWeek { get; set; }
        public bool? IsProjectReport { get; set; }
    }

    public class ReportModelResponse
    {
        public List<MemberReportModel>? ReportList { get; set; }
        public DateTime? ProjectCreatedDate { get; set; }
        public bool? IsWeeklyReport { get; set; }
        public bool? IsMultiProject { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }

    public class MemberReportModel : ReportTableModel
    {
        public string? StudentName { get; set; }
        public List<MemberReportModel>? MemberReportList { get; set; }
    }
}
