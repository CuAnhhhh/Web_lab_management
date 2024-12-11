using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class SchedulerTableModel
    {
        [Key]
        public string? SchedulerId { get; set; }
        public int? EventType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public string? CreatedBy { get; set; }
        public string? ProjectId { get; set; }
    }

    public class SchedulerModelResponse
    {
        public List<SchedulerTableModel>? SchedulerList { get; set; }
        public string? ProjectId { get; set; }
        public bool? IsLeader { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }
}
