using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class TemplateTableModel
    {
        [Key]
        public string? TemplateId { get; set; }
        public string? TemplateName { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
    }

    public class TemplateModelResponse
    {
        public List<TemplateTableModel>? TemplateList { get; set; }
        public bool? IsDone { get; set; }
        public int? Total { get; set; }
        public string? Error { get; set; }
    }
}
