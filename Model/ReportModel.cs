using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class ReportTableModel
    {
        [Key]
        public string? ReportId { get; set; }
        public string? ProjectId { get; set; }
        public string? StudentId { get; set; }
        public string? Comment { get; set; }
        public string? StudentReport { get; set; }
        public DateTime? ReportedDate { get; set; }
        public int? ReportedWeek { get; set; }
        public int? StudentScore { get; set; }
    }

    public class GetReportModel
    {
        public string? StudentId { get; set; }
        public string? CurrentId { get; set; }
    }

    public class ReportModelResponse
    {
        public List<ReportTableModel>? ReportList { get; set; }
        public DateTime? ProjectCreatedDate { get; set; }
        public bool? IsLeader { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }
}
