using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class ProjectStudentRelationshipTableModel
    {
        [Key]
        public string? RelationshipId { get; set; }
        public string? ProjectId { get; set; }
        public string? StudentId { get; set; }
        public bool? IsLeader { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? RemovedDate { get; set; }
        public string? RemovedBy { get; set; }
        public int? Status { get; set; }
    }

    public class ProjectStudentRelationshiplistModel : ProjectStudentRelationshipTableModel
    {
        public string? StudentName { get; set; }
    }
}
