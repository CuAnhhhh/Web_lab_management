using System.ComponentModel.DataAnnotations;

namespace DATN.Model
{
    public class ChatboxTableModel
    {
        [Key]
        public string? MessageId { get; set; }
        public string? SendId { get; set; }
        public string? ReceiveId { get; set; }
        public string? Message { get; set; }
        public bool? MessageType { get; set; }
        public DateTime? TimeStamp { get; set; }
    }

    public class ChatboxResponseModel
    {
        public List<ChatboxTableModel>? MessageList { get; set; }
        public bool? IsDone { get; set; }
        public string? Error { get; set; }
    }
}
