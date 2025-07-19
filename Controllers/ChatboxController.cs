using DATN.DataContext;
using DATN.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ChatboxController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpPost()]
        [Route("getmessage")]
        public ChatboxResponseModel GetMessage([FromBody] ChatboxTableModel model)
        {
            if (model.MessageType == true)
            {
                var list = db
                    .Messages.Where(m =>
                        m.MessageType == true
                        && (
                            m.SendId == model.SendId && m.ReceiveId == model.ReceiveId
                            || m.SendId == model.ReceiveId && m.ReceiveId == model.SendId
                        )
                    )
                    .OrderBy(m => m.TimeStamp);

                return new ChatboxResponseModel { IsDone = true, MessageList = [.. list] };
            }
            else
            {
                var list = db
                    .Messages.Where(m => m.MessageType == false && m.ReceiveId == model.ReceiveId)
                    .OrderBy(m => m.TimeStamp);
                return new ChatboxResponseModel { IsDone = true, MessageList = [.. list] };
            }
        }
    }

    public class ChatHub(MyDbContext context) : Hub
    {
        private static readonly Dictionary<string, string?> userConnections = [];
        private readonly MyDbContext db = context;

        public override Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId))
            {
                userConnections[userId] = Context.ConnectionId;
            }
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId))
            {
                userConnections.Remove(userId, out _);
            }

            return base.OnDisconnectedAsync(exception);
        }

        public async Task<ChatboxTableModel> SendMessageToUser(ChatboxTableModel model)
        {
            model.MessageId = Guid.NewGuid().ToString();
            if (model.MessageType == false)
            {
                if (model.ReceiveId == "lab")
                {
                    var users = await db
                        .Students.Where(r => r.Status != (int)StudentStatus.OutLab)
                        .Select(r => r.StudentId)
                        .ToListAsync();
                    foreach (string? user in users)
                    {
                        if (userConnections.TryGetValue(user ?? "", out string? connectionId))
                        {
                            await Clients
                                .Client(connectionId ?? "")
                                .SendAsync("ReceiveMessage", model);
                        }
                    }
                }
                else
                {
                    var users = db
                        .ProjectStudentRelationship.Where(r =>
                            r.Status == (int)StudentRelationshipStatus.InProgress
                            && r.ProjectId == model.ReceiveId
                            && r.StudentId != model.SendId
                        )
                        .Select(r => r.StudentId);
                    foreach (string? user in users)
                    {
                        if (userConnections.TryGetValue(user ?? "", out string? connectionId))
                        {
                            await Clients
                                .Client(connectionId ?? "")
                                .SendAsync("ReceiveMessage", model);
                        }
                    }
                }
            }
            else
            {
                if (userConnections.TryGetValue(model.ReceiveId ?? "", out string? connectionId))
                {
                    await Clients.Client(connectionId ?? "").SendAsync("ReceiveMessage", model);
                }
            }
            db.Messages.Add(model);
            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return new ChatboxTableModel { MessageId = "0", Message = ex.Message };
            }
            return model;
        }
    }
}
