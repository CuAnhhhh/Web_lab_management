using DATN.Model;
using Microsoft.EntityFrameworkCore;

namespace DATN.DataContext
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options)
            : base(options) { }

        public DbSet<SchedulerTableModel> Schedulers { get; set; }
        public DbSet<StudentTableModel> Students { get; set; }
        public DbSet<ProjectTableModel> Projects { get; set; }
        public DbSet<TemplateTableModel> Templates { get; set; }
        public DbSet<ProjectStudentRelationshipTableModel> ProjectStudentRelationship { get; set; }
        public DbSet<ProjectTypeTableModel> ProjectType { get; set; }
        public DbSet<StudentRoleTableModel> StudentRole { get; set; }
        public DbSet<FileTableModel> Files { get; set; }
        public DbSet<ReportTableModel> Reports { get; set; }
        public DbSet<ChatboxTableModel> Messages { get; set; }
    }
}
