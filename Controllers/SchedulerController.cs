using System.Security.Authentication;
using DATN.DataContext;
using DATN.Model;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;

namespace DATN.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SchedulerController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext db = context;

        [HttpGet()]
        [Route("getschedulers/{studentId?}")]
        public SchedulerModelResponse GetSchedulers(string? studentId)
        {
            if (studentId != "0")
            {
                var sr = db.ProjectStudentRelationship.FirstOrDefault(r =>
                    r.StudentId == studentId
                    && r.Status == (int)StudentRelationshipStatus.InProgress
                );
                if (sr == null)
                {
                    return new SchedulerModelResponse { SchedulerList = [], IsDone = true };
                }
                var p = db.Projects.FirstOrDefault(p => p.ProjectId == sr.ProjectId);
                var dbSc = db
                    .Schedulers.Where(s => s.ProjectId == sr.ProjectId)
                    .OrderBy(s => s.StartDate);
                var dbSt = db.Students.Where(s => s.Status != (int)StudentStatus.OutLab);

                var list =
                    from sc in dbSc
                    join st in dbSt on sc.CreatedBy equals st.StudentId into dbScCreate
                    from scCreate in dbScCreate.DefaultIfEmpty()
                    select new SchedulerListModel
                    {
                        ProjectId = sc.ProjectId,
                        ProjectName = p.ProjectName,
                        SchedulerId = sc.SchedulerId,
                        EventType = sc.EventType,
                        StartDate = sc.StartDate,
                        EndDate = sc.EndDate,
                        Description = sc.Description,
                        CreatedBy = scCreate.StudentId,
                        CreatedByName = scCreate.StudentName,
                    };

                return new SchedulerModelResponse { SchedulerList = [.. list], IsDone = true };
            }
            else
            {
                var dbSc = db.Schedulers.OrderBy(s => s.StartDate);
                var dbSt = db.Students.Where(s => s.Status != (int)StudentStatus.OutLab);
                var dbP = db.Projects.Where(s => s.IsActive == true);

                var list =
                    from sc in dbSc
                    join st in dbSt on sc.CreatedBy equals st.StudentId into dbScCreate
                    from scCreate in dbScCreate.DefaultIfEmpty()
                    join p in dbP on sc.ProjectId equals p.ProjectId into dbScProject
                    from scProject in dbScProject.DefaultIfEmpty()
                    select new SchedulerListModel
                    {
                        ProjectId = sc.ProjectId,
                        ProjectName = scProject.ProjectName,
                        SchedulerId = sc.SchedulerId,
                        EventType = sc.EventType,
                        StartDate = sc.StartDate,
                        EndDate = sc.EndDate,
                        Description = sc.Description,
                        CreatedBy = scCreate.StudentId,
                        CreatedByName = scCreate.StudentName,
                    };
                return new SchedulerModelResponse { SchedulerList = [.. list], IsDone = true };
            }
        }

        [HttpPost()]
        [Route("createscheduler")]
        public async Task<ResponseModel> CreateScheduler([FromBody] SchedulerTableModel model)
        {
            var exsistSchedule = await db.Schedulers.AnyAsync(s =>
                s.StartDate < model.StartDate && s.EndDate > model.StartDate
                || s.StartDate < model.EndDate && s.EndDate > model.EndDate
                || s.StartDate > model.StartDate && s.EndDate < model.EndDate
            );
            if (exsistSchedule)
            {
                return new ResponseModel
                {
                    IsDone = false,
                    ErrorCode = 101,
                    Error = "Exsist a schedule in selected time",
                };
            }
            await SendEmailToMember(model);
            model.SchedulerId = Guid.NewGuid().ToString();
            db.Schedulers.Add(model);
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }

            return new ResponseModel { Id = model.SchedulerId, IsDone = true };
        }

        [HttpPost()]
        [Route("deletescheduler")]
        public ResponseModel DeleteScheduler([FromBody] SchedulerTableModel model)
        {
            var s = db.Schedulers.FirstOrDefault(s => s.SchedulerId == model.SchedulerId);
            if (s == null)
            {
                return new ResponseModel { IsDone = false, Error = "Don't exsist schedule!" };
            }
            db.Schedulers.Remove(s);
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                return new ResponseModel { IsDone = false, Error = ex.Message };
            }
            return new ResponseModel { Id = model.SchedulerId, IsDone = true };
        }

        private async Task SendEmailToMember(SchedulerTableModel model)
        {
            var memberListId = await (
                db
                    .ProjectStudentRelationship.Where(r =>
                        r.ProjectId == model.ProjectId
                        && r.Status == (int)StudentRelationshipStatus.InProgress
                    )
                    .Select(r => r.StudentId)
            ).ToListAsync();

            var emailList = await (
                db.Students.Where(s => memberListId.Contains(s.StudentId)).Select(s => s.Email)
            ).ToListAsync();

            string subject = "Mail for upcoming event";
            string? startDate = model?.StartDate?.ToString("dd/MM/yyyy HH:mm");
            string? endDate = model?.EndDate?.ToString("dd/MM/yyyy HH:mm");
            string message =
                $"Member need to join this event: {(model?.EventType == 101 ? "Exam" : "Meeting")} at {startDate} to {endDate}."
                + $"<br>Description: {model?.Description ?? "N/A"}"
                + $"<br>Created By: {(model?.CreatedBy == "0" ? "Teacher" : "Leader")}";

            foreach (var email in emailList)
            {
                //var valid = await IsEmailValid(email ?? "");
                //if (valid)
                //{
                await SendEmailAsync(
                    new EmailRequestModel
                    {
                        To = email,
                        Subject = subject,
                        Message = message,
                    }
                );
                //}
            }
        }

        private readonly string _smtpServer = "smtp.gmail.com";
        private readonly int _port = 587;
        private readonly string _emailSender = "wicom.lab.mailsystem@gmail.com";
        private readonly string _password = "hjgd aepq uczr rpyk";

        private async Task SendEmailAsync(EmailRequestModel model)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("WICOM Lab System", _emailSender));
            email.To.Add(new MailboxAddress("", model.To));
            email.Subject = model.Subject;

            email.Body = new TextPart("html") { Text = model.Message };

            using var smtp = new SmtpClient();
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
            await smtp.ConnectAsync(_smtpServer, _port);
            await smtp.AuthenticateAsync(_emailSender, _password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        //public static async Task<bool> IsEmailValid(string email)
        //{
        //    using var httpClient = new HttpClient();
        //    var response = await httpClient.GetStringAsync(
        //        $"https://api.zerobounce.net/v2/validate?api_key=YOUR_API_KEY&email={email}"
        //    );
        //    return response.Contains("\"status\":\"valid\"");
        //}
    }
}
